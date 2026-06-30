import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TRPCProvider } from "@/trpc/provider";
import { Analytics } from "@vercel/analytics/react";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Academix KTU | Advanced Results Dashboard",
    template: "%s | Academix KTU"
  },
  description: "The ultimate, premium analytics dashboard for APJ Abdul Kalam Technological University (KTU) students. Check your results, calculate SGPA & CGPA, and track your academic trajectory instantly without a database.",
  applicationName: "Academix KTU",
  generator: "Next.js",
  keywords: [
    "KTU", "Academix", "Academix KTU", "KTU Results", "KTU Login", "KTU Student Portal",
    "APJ Abdul Kalam Technological University", "BTech Results KTU", "KTU SGPA Calculator", 
    "KTU CGPA Calculator", "Kerala Tech", "B.Tech Kerala", "Engineering Results Kerala",
    "KTU Analytics", "KTU Grade Card", "KTU Result Scraper", "KTU Fast Results"
  ],
  authors: [{ name: "Anandhakrishnan", url: "https://anandhakrishnan-portfolio.vercel.app/" }],
  creator: "Anandhakrishnan",
  publisher: "Anandhakrishnan",
  category: "Education",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://academix-ktu.vercel.app"),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Academix KTU - Advanced Results Dashboard",
    description: "Instantly check your KTU results, calculate SGPA, and view your academic trajectory with beautiful analytics.",
    url: "https://academix-ktu.vercel.app",
    siteName: "Academix KTU",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Academix KTU | Advanced Results Dashboard",
    description: "Check your KTU results and calculate SGPA instantly with Academix KTU.",
    creator: "@anandhakrishnan",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "google-site-verification-code-here",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Academix KTU",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TRPCProvider>{children}</TRPCProvider>
        <Analytics />
      </body>
    </html>
  );
}
