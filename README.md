# 🎓 Academix KTU - Advanced Results Dashboard

![Academix KTU](https://img.shields.io/badge/Status-Production_Ready-success?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=for-the-badge&logo=typescript)

Welcome to **Academix KTU**, an ultra-premium, high-performance analytics dashboard engineered specifically for APJ Abdul Kalam Technological University (KTU) students. Built to replace the outdated, slow, and clunky official portal, Academix provides students with a visually stunning, instantaneous, and deeply analytical view of their academic performance.

---

## ✨ Key Features

- **🚀 Headless Scraping Engine**: Securely and instantaneously fetches your KTU results using a custom-built, server-side Node.js web scraper (`cheerio` & `undici`) without needing a traditional database.
- **📈 SGPA Trajectory Analytics**: Automatically calculates your SGPA and CGPA, and visualizes your academic trend across semesters using beautiful, interactive line charts (`recharts`).
- **🪪 3D Holographic ID Cards**: A highly interactive, physics-based 3D student ID card that tracks your mouse cursor and shines with a glossy holographic glare.
- **📄 Professional PDF Export**: Generate a beautifully formatted, print-ready A4 PDF document of your grade card with a single click (`jspdf`).
- **📱 Installable PWA**: Fully configured as a Progressive Web App. Install Academix directly to your iOS or Android home screen for a native app experience!
- **🎨 Glassmorphism & Dark Mode**: A meticulously designed, fully responsive UI utilizing advanced CSS techniques like backdrop filters, skeleton loaders, and dynamic state styling.
- **🍞 Sleek Toast Notifications**: Modern, non-intrusive UI feedback using `sonner`.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **API Layer**: [tRPC](https://trpc.io/) (End-to-end typesafe APIs)
- **Scraping Engine**: [Cheerio](https://cheerio.js.org/) + [Undici](https://undici.nodejs.org/)
- **Data Visualization**: [Recharts](https://recharts.org/)
- **Styling**: Vanilla CSS (Globals) with custom UI components
- **PWA Integration**: `@ducanh2912/next-pwa`

---

## ⚙️ How It Works (The Architecture)

1. **Authentication**: When a user enters their credentials, the tRPC backend securely establishes a session with the official KTU servers (`app.ktu.edu.in`) using an optimized `undici` dispatcher.
2. **Scraping & Parsing**: The backend navigates to the student's Grade Card page, fetches the raw HTML, and uses `cheerio` to parse the DOM tree into structured JSON data.
3. **Analytics**: The backend calculates credit-weighted SGPAs for all passed courses and formats the data for the frontend.
4. **Rendering**: The Next.js frontend receives the JSON and instantly hydrates the dynamic UI, rendering the 3D cards, charts, and tables in milliseconds.
*(Note: No passwords or personal data are ever stored in a database. All transactions are ephemeral and directly between the client and KTU servers).*

---

## 🚀 Local Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/Academix-KTU.git
   cd Academix-KTU
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```
   *Note: Next.js Turbopack is safely silenced in development to allow the PWA engine to compile correctly during production builds.*

4. **Open the App**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deployment

This project is optimized for a zero-config deployment on **Vercel**. 
Simply import the repository into your Vercel dashboard, leave the default Next.js build settings, and click Deploy. The Next.js App Router and Edge/Node functions will handle the heavy lifting!

---

## 👨‍💻 Developer

Developed with ❤️ by **Anandhakrishnan**. 
- **Portfolio**: [https://anandhakrishnan-portfolio.vercel.app/](https://anandhakrishnan-portfolio.vercel.app/)

*Disclaimer: This is an unofficial dashboard. It is not affiliated with, endorsed by, or sponsored by APJ Abdul Kalam Technological University.*
