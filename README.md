# 🛡️ ATHX Security (Enterprise API Security Platform)

[![React 19](https://img.shields.io/badge/React-19.x-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.x-purple?style=for-the-badge&logo=vite)](https://vite.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-24.x-green?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![AI-Copilot](https://img.shields.io/badge/AI--Copilot-OpenRouter-orange?style=for-the-badge&logo=openai)](https://openrouter.ai/)

An elite, enterprise-style API security assessment platform. Users submit a target URL, the backend schedules and runs a battery of live security scanners against it, and the results are rendered in real-time through an interactive, glassmorphic cybersecurity command dashboard. Includes an AI-powered vulnerability copilot and a dynamic Attack Surface mapping generator.

---

## ⚡ Real Working vs. Simulated Features

To facilitate zero-configuration local runs and investor pitches, ATHX incorporates smart dual-modes: **Production (Live)** and **Demo (Simulated)**. Below is a detailed breakdown of codebase states:

| Feature Area | Actual Working Status | Simulated / Fallback State | Production Ready? |
| :--- | :--- | :--- | :--- |
| **🤖 AI Code Patches** | Generates dynamic code fixes in `diff` blocks via OpenRouter LLMs. | None (All AI output is live via LLM). | **Yes** ✅ |
| **🗂️ OpenAPI Spec Exporter** | Maps crawled routes and endpoints to standard OpenAPI v3.0 specs. | None (Generates live from inventory schema). | **Yes** ✅ |
| **🔒 PDF Audit Report** | Compiles full scan summaries and compliance charts into a PDF. | None (Consolidated Puppeteer PDF writes live). | **Yes** ✅ |
| **📦 WAF Patching** | Dynamic rule generation matching vulnerability categories. | None (Generates ModSec, AWS, CF rules dynamically). | **Yes** ✅ |
| **⚡ GitHub Sync (Live)** | Centered Popup OAuth flow, lists repositories/branches, pushes workflows. | Falls back to Local Mock Auth server if keys are missing in `.env`. | **Yes** ✅ (With real keys) |
| **✨ GitHub Sync (Demo)** | Mock Auth Modal, pre-populated repositories, branch options, mock commits. | Mocks external API calls to show direct UI/UX flow. | **For Demos** 🎨 |
| **📡 Crawler Scanner** | Axios crawler scraping HTML anchors, forms, parameters. | Runs 23 active scanner checks. | **Yes** ✅ |

---

## 🚀 Current Working Features (Detail)

### 🤖 1. Stack-Specific AI Code Patches (Interactive Diffs)
* **LLM Prompts:** Instructs OpenRouter AI agents to deliver code-level remediations wrapped in raw `diff` code blocks.
* **Diff Renderer:** Frontend splits the diff files and styles line additions (green backdrop) and line removals (red backdrop) with clear borders for high-readability code fixes.

### 🏗️ 2. CI/CD Security Gate Wizard & GitHub OAuth Integration
* **Centered Popup Login:** Clicking connect opens a centered popup window. Once authorized on GitHub, the popup uses same-origin message protocol to pass credentials to the parent window and close itself.
* **Zero-Config Mock Bypass:** If `GITHUB_CLIENT_ID` is missing in the `.env`, the server loads a gorgeous local mock authorization page in the popup, enabling a working OAuth flow mockup.
* **Dropdown Sync:** Automatically pulls the user's active repositories list from GitHub and populates a dropdown.
* **Dynamic Branch Selection:** Automatically retrieves the list of branches (e.g., `main`, `dev`, `master`) for the selected repository and renders them in a dropdown menu.
* **1-Click Workflow Sync:** Instantly commits the custom gate workflow file `.github/workflows/athx-security-scan.yml` to the target branch.
* **PAT Manual Fallback:** Always allows users to connect manually using their own Personal Access Token (PAT).

### 🗂️ 3. Reverse-Engineered OpenAPI Spec Exporter
* **Spec Generation:** Maps crawled target URLs and active endpoint parameters into standard OpenAPI v3.0 specs.
* **Export Center:** Exposes a download button in the dashboard to download the generated spec as a JSON file.

### 📊 4. Consolidated PDF Audit Reports
* **Pipeline Safety:** Handled Puppeteer PDF write stream synchronization in backend routes to ensure server stability.
* **PDF Exporter:** Compiles executive summaries, scanner metrics, WAF patch configurations, and security grades into a PDF.

---

## 🔭 Future Development Roadmap
* **👥 Multi-Tenant Teams:** Shared team workspaces, role-based access control, and user audit logging.
* **💳 Stripe Billing Integration:** Subscription plan tiers, usage meters, and checkout gateways.
* **⏳ Redis/BullMQ Task Queues:** Moving scanning operations to background worker queues.
* **🦊 GitLab CI Support:** Adding templates and auto-sync support for GitLab CI/CD files.

---

## 📐 Architecture Overview
```
backend/
  src/
    modules/
      auth/           → JWT authentication (tokens, rotation, google bypass)
      scans/          → Scan model, controllers, and core pipeline orchestrator
      scanner/        → Scanners implementations (headers, ssl, command, exposed files, web-crawler)
      engines/        → Security score calculation engine (CVSS, grading rules)
      vulnerabilities/  → 369-entry vulnerability catalog schema and normalizer
      reports/        → PDF/JSON reporting utilities & OpenAPI spec generator
      dashboard/      → Stats aggregation query handlers
      ai/             → AI narrative generator backed by OpenRouter LLMs
      settings/       → Webhook configs, GitHub OAuth connection, mock auth servers

frontend/
  src/
    pages/            → DashboardPage, ScanExecutionPage, ScansPage, SettingsPage
    components/
      layouts/        → Redesigned glassmorphic Sidebar navigation
      scans/          → ScanHeader, ScanConfigurationCard, LiveScannerLogs, AttackSurfaceMap, ScanStatusCard
      dashboard/      → Interactive KPIs, charts, and findings panels
      ai/             → AI analyst detail cards
```

---

## 🚀 Setup & Execution

### Installation

1. **Clone & Install Dependencies:**
   ```bash
   git clone https://github.com/Atharv-design/api-security-scanner.git
   cd api-security-scanner
   ```

2. **Configure Environment Variables:**
   * Create a `.env` file in the `backend/` directory:
     ```env
     NODE_ENV=development
     PORT=5000
     MONGODB_URI=your_mongodb_connection_string
     JWT_ACCESS_SECRET=your_jwt_access_secret
     JWT_REFRESH_SECRET=your_jwt_refresh_secret
     CLIENT_URL=http://localhost:5173
     OPENROUTER_API_KEY=your_openrouter_api_key
     
     # Optional: For Live GitHub OAuth connection
     GITHUB_CLIENT_ID=your_github_client_id
     GITHUB_CLIENT_SECRET=your_github_client_secret
     ```

3. **Start the Backend Server:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

4. **Start the Frontend Client:**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.
