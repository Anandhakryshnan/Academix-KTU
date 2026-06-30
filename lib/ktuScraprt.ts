import * as cheerio from "cheerio";
import { Agent, fetch as undiciFetch } from "undici";
import * as fs from "fs";
import * as path from "path";

export interface CourseResult {
  courseCode: string;
  courseName: string;
  credit: string;
  grade: string;
}

export interface ScraperInput {
  sessionId: string;
  csrfToken: string;
  semesterId: number;
  studentId?: string;
  cookies?: string;
}

export interface TrendData {
  semester: string;
  sgpa: number;
}

export interface StudentDetails {
  name: string;
  registerNo: string;
  college: string;
  branch: string;
}

export interface ScraperResult {
  courses: CourseResult[];
  sgpa?: string;
  cgpa?: string;
  studentDetails?: StudentDetails;
  trendData?: TrendData[];
}

const dispatcher = new Agent({
  connect: {
    rejectUnauthorized: false,
  },
});

export async function scrapeKTUResults(
  input: ScraperInput
): Promise<ScraperResult> {
  const { sessionId, csrfToken, semesterId, studentId, cookies } = input;

  console.log(
    "[SCRAPER] Starting scrape. Semester:",
    semesterId,
    "StudentId:",
    studentId || "(self)"
  );

  const cookieHeader = cookies || `JSESSIONID=${sessionId}`;

  console.log("[SCRAPER] Fetching data from Full Student Profile...");
  
  const profileResponse = await undiciFetch(
    "https://app.ktu.edu.in/eu/stu/studentDetailsView.htm",
    {
      method: "GET",
      dispatcher,
      headers: {
        Cookie: cookieHeader,
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        Referer: "https://app.ktu.edu.in/eu/core/studentHome.htm",
      }
    }
  );

  if (!profileResponse.ok) {
    throw new Error(`Failed to fetch full profile. Status: ${profileResponse.status}`);
  }

  const profileHtml = await profileResponse.text();
  
  if (profileHtml.toLowerCase().includes("session expired")) {
    throw new Error("Invalid or expired session.");
  }

  const $prof = cheerio.load(profileHtml);
  const allCourses: CourseResult[] = [];
  const trendData: TrendData[] = [];

  // If semesterId === 0, fetch 1 through 10. Otherwise, just fetch the specific semesterId.
  const startSem = semesterId === 0 ? 1 : semesterId;
  const endSem = semesterId === 0 ? 10 : semesterId;

  // Extract Student Details
  let name = "";
  let registerNo = "";
  let college = "";
  let branch = "";
  
  const titleText = $prof("h3.panel-title").text().trim();
  
  // If there's no student name found, we are not on the grade card page (likely the login page)
  if (!titleText) {
    throw new Error("Invalid credentials. Please check your KTU username and password.");
  }

  // Example: AISWARYA M(LIDK21CS069) (GOVERNMENT ENGINEERING COLLEGE IDUKKI)
  const nameMatch = titleText.match(/^(.*?)\((.*?)\)\s*\((.*?)\)/);
  if (nameMatch) {
    name = nameMatch[1].trim();
    registerNo = nameMatch[2].trim();
    college = nameMatch[3].trim();
  } else {
    name = titleText;
  }
  
  $prof("li.list-group-item").each((_, li) => {
    const text = $prof(li).text();
    if (text.includes("Admitted Branch")) {
       branch = text.replace("Admitted Branch", "").trim();
    }
  });

  const studentDetails = { name, registerNo, college, branch };

  for (let i = startSem; i <= endSem; i++) {
    const semesterDiv = $prof(`#collapseFiveS${i}`);
    if (semesterDiv.length > 0) {
      const semCourses: CourseResult[] = [];

      semesterDiv.find("table tbody tr").each((_, row) => {
        const cells = $prof(row).find("td");
        if (cells.length >= 8) {
          const courseText = $prof(cells[1]).text().replace(/\s+/g, " ").trim();
          const credit = $prof(cells[2]).text().trim();
          const grade = $prof(cells[7]).text().trim();
          
          if (courseText && courseText.includes("-")) {
            const parts = courseText.split("-");
            const courseCode = parts[0]?.trim();
            const courseName = parts.slice(1).join("-").trim();
            
            if (courseCode) {
              const crs = {
                courseCode,
                courseName,
                credit: credit || "0",
                grade: grade || "-"
              };
              allCourses.push(crs);
              semCourses.push(crs);
            }
          }
        }
      });

      if (semesterId === 0 && semCourses.length > 0) {
        const uniqueSemCourses = semCourses.filter((v, i, a) => a.findIndex(t => (t.courseCode === v.courseCode)) === i);
        const semSgpaStr = calculateSGPA(uniqueSemCourses);
        trendData.push({ semester: `S${i}`, sgpa: parseFloat(semSgpaStr) });
      }
    }
  }

  const uniqueCourses = allCourses.filter((v, i, a) => a.findIndex(t => (t.courseCode === v.courseCode)) === i);
  const sgpa = calculateSGPA(uniqueCourses);
  
  return {
    courses: uniqueCourses,
    sgpa: sgpa,
    studentDetails,
    trendData: semesterId === 0 ? trendData : undefined
  };
}

function parseResultTable(html: string): CourseResult[] {
  const $ = cheerio.load(html);
  const courses: CourseResult[] = [];

  $("table").each((_, t) => {
    const header = $(t).text().toLowerCase();

    // Much more lenient table matching for failed semesters or weird formats
    if (
      header.includes("course") || 
      header.includes("grade") || 
      header.includes("subject")
    ) {
      let codeIdx = -1;
      let nameIdx = -1;
      let creditIdx = -1;
      let gradeIdx = -1;

      $(t)
        .find("tr")
        .first()
        .find("th, td")
        .each((i, cell) => {
          const text = $(cell).text().trim().toLowerCase();

          if (text.includes("course code") || text === "code") codeIdx = i;
          else if (text.includes("course name") || text.includes("subject")) nameIdx = i;
          else if (text.includes("credit")) creditIdx = i;
          else if (text.includes("grade") || text.includes("result") || text.includes("mark")) gradeIdx = i;
        });

      if (codeIdx === -1) codeIdx = 1;
      if (nameIdx === -1) nameIdx = 2;
      if (creditIdx === -1) creditIdx = 3;
      if (gradeIdx === -1) gradeIdx = 4;

      $(t).find("tr").each((_, row) => {
        const cells = $(row).find("td, th");

        if (cells.length < 3) return;

        const courseCode = $(cells[codeIdx])?.text().trim() || "";
        const courseName = $(cells[nameIdx])?.text().trim() || "";
        const credit = $(cells[creditIdx])?.text().trim() || "0";
        const grade = $(cells[gradeIdx])?.text().trim() || "-";

        if (
          !courseCode ||
          courseCode.toLowerCase() === "code" ||
          courseCode.toLowerCase().includes("course") ||
          courseCode.toLowerCase() === "sl.no" ||
          courseCode.toLowerCase() === "si no"
        ) {
          return;
        }

        courses.push({
          courseCode,
          courseName,
          credit,
          grade,
        });
      });
    }
  });

  // Filter out duplicates just in case multiple matching tables parse the same things
  const uniqueCourses = courses.filter((v, i, a) => a.findIndex(t => (t.courseCode === v.courseCode)) === i);

  return uniqueCourses;
}

function calculateSGPA(courses: CourseResult[]): string {
  const gradePoints: Record<string, number> = {
    "S": 10,
    "A+": 9,
    "A": 8.5,
    "B+": 8,
    "B": 7.5,
    "C+": 7,
    "C": 6.5,
    "D": 6,
    "P": 5.5,
    "F": 0,
    "FE": 0,
    "ABSENT": 0
  };

  let totalCredits = 0;
  let weightedPoints = 0;

  for (const course of courses) {
    const credit = Number(course.credit);
    const grade = course.grade.trim().toUpperCase();

    const gradePoint = gradePoints[grade] ?? 0;

    totalCredits += credit;
    weightedPoints += credit * gradePoint;
  }

  if (totalCredits === 0) {
    return "0.00";
  }

  const sgpa = weightedPoints / totalCredits;

  return sgpa.toFixed(2);
}