import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../init";
import { loginKTU } from "@/lib/ktuLogin";
import { scrapeKTUResults } from "@/lib/ktuScraprt";
import { generateToken } from "@/lib/apiToken";
import { checkAccountRateLimit } from "@/lib/rateLimit";
import { TRPCError } from "@trpc/server";

const getResultsInputSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  semesterId: z.number().int().min(0).max(8),
  studentId: z.string().optional(),
});

export const resultRouter = createTRPCRouter({
  getToken: publicProcedure.query(() => {
    return generateToken();
  }),

  getResults: protectedProcedure
    .input(getResultsInputSchema)
    .mutation(async ({ input }) => {
      const accountLimit = checkAccountRateLimit(input.username);
      if (!accountLimit.allowed) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: `Too many requests for this account. Please wait ${Math.ceil(accountLimit.resetIn / 1000)} seconds before trying again to prevent KTU account suspension.`,
        });
      }

      let lastError: Error | null = null;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const { sessionId, csrfToken, cookies } = await loginKTU(
            input.username,
            input.password
          );
          const result = await scrapeKTUResults({
            sessionId,
            csrfToken,
            semesterId: input.semesterId,
            studentId: input.studentId,
            cookies,
          });
          
          return {
            courses: result.courses,
            count: result.courses.length,
            studentDetails: result.studentDetails,
            trendData: result.trendData,
          };
        } catch (error) {
          console.error(`[TRPC] KTU SCRAPER ERROR (Attempt ${attempt}/3):`, error);
          lastError = error instanceof Error ? error : new Error("Unknown scraper error");
          
          // Don't retry on obvious client errors (e.g. invalid credentials)
          if (lastError.message.toLowerCase().includes("credentials")) {
             break;
          }
          
          if (attempt < 3) {
             // Wait before retrying (exponential backoff: 2s, 4s)
             await new Promise(res => setTimeout(res, attempt * 2000));
          }
        }
      }

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: lastError ? lastError.message : "Scraper failed after retries",
      });
    }),
});