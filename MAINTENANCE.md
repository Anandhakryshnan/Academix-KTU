# 🛠️ Academix KTU - Maintenance & Operations Guide

This document outlines the standard operating procedures for maintaining the Academix KTU application in production. Since this application relies on headless web scraping, **proactive maintenance is required** if the underlying KTU portal undergoes architectural changes.

---

## 1. The Scraping Engine (`lib/ktuScraprt.ts` & `lib/ktuLogin.ts`)

The core of the application relies on fetching and parsing the raw DOM from `app.ktu.edu.in`. 

### Expected Breakages
If the KTU portal updates its UI, the scraper will fail. Here is how to diagnose and fix it:
- **Login Failures**: If legitimate users suddenly get "Invalid Credentials" across the board, KTU may have added a new hidden input token (like a CSRF token) to their login form, or changed the `action` URL. 
  - *Fix:* Inspect the official KTU login page network tab, update the payload object in `ktuLogin.ts`, and ensure any hidden `<input>` values are scraped in the pre-flight request.
- **Grade Card Empty / Not Found**: If the table headers or CSS classes in the grade card change, `cheerio` will fail to extract course strings.
  - *Fix:* Navigate to `ktuScraprt.ts`, search for the CSS selectors (e.g., `h3.panel-title`, `div.panel`, `#collapseFiveS1`), and update them to match KTU's new DOM structure.

### Session & IP Limits
KTU servers employ rate-limiting. If the scraper receives an `ACCESS DENIED` or `Too many requests` string, the Vercel edge/server IP may have been temporarily blacklisted.
- *Mitigation:* Ensure that requests are tied to the user's explicit action. Do not run automated polling scripts against KTU servers. If Vercel IPs get permanently banned, you may need to route the requests through rotating residential proxies in the `undici` fetch dispatcher.

---

## 2. Progressive Web App (PWA) Engine

The PWA is powered by `@ducanh2912/next-pwa`.
- **Caching Issues**: If you deploy a new update and users complain they still see the old UI, they are likely trapped in a stale Service Worker cache.
  - *Fix:* Instruct users to completely close their app/browser tab, wait 5 seconds, and reopen it (this allows the Service Worker to perform a background update).
- **Turbopack Warning**: In development mode (`npm run dev`), you will see a warning about Turbopack ignoring the webpack config. This is intentional (`turbopack: {}` in `next.config.ts`) and safely disables the PWA engine locally to speed up your local development environment.

---

## 3. PDF Export Engine (`jspdf`)

The PDF generation relies on `jspdf` and `jspdf-autotable`.
- **Formatting Issues**: If you add new columns to the `ResultTable.tsx` component, you **must** update the headers and body extraction logic inside the `handleDownloadPDF` function so the table widths don't overflow the A4 page boundaries.

---

## 4. Upgrading Dependencies

Keep the following critical dependencies up-to-date using `npm outdated` and `npm update`:
- **`undici`**: Handles the cookie jar and HTTP redirects. Keep it updated for security patches.
- **`cheerio`**: Crucial for fast DOM parsing.
- **`next`**: When upgrading Next.js, ensure you test the PWA plugin compatibility, as Next.js frequently alters its build pipeline.

---

## 5. Quick Health Check Command

If you need to verify the integrity of the application locally before a deploy, run:
```bash
# Clears the Next.js cache
rm -rf .next 

# Rebuilds the production bundles and Service Workers
npm run build 

# Starts the production instance locally
npm run start
```
If `npm run build` throws no TypeScript (`tsc`) or ESLint errors, the app is mathematically stable from a compilation standpoint.
