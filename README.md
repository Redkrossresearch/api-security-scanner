# 🛡️ ATHX Security (Enterprise API Security Platform)

[![React 19](https://img.shields.io/badge/React-19.x-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.x-purple?style=for-the-badge&logo=vite)](https://vite.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-24.x-green?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![AI-Copilot](https://img.shields.io/badge/AI--Copilot-OpenRouter-orange?style=for-the-badge&logo=openai)](https://openrouter.ai/)

An elite, enterprise-style API security assessment platform. Users submit a target URL, the backend schedules and runs a battery of live security scanners against it, and the results are rendered in real-time through an interactive, glassmorphic cybersecurity command dashboard. Includes an AI-powered vulnerability copilot and a dynamic Attack Surface mapping generator.

---

## ⚡ Current Real Working Features

### 📡 1. Real-Time Scanners & Web Crawler
* **Axios HTML Web Crawler:** Dynamically scrapes HTML anchors, form elements, and parameters from any input target URL to auto-discover active paths.
* **Active Scanning Suite (23 Parallel Modules):**
  * **Passive Config Probes:** Security headers, SSL/TLS validation, CORS policies, cookies flags, server information disclosure, and technology fingerprinting.
  * **API & Attack Surface:** OpenAPI specification discovery, custom dynamic API inventory, and endpoint risk assessment.
  * **Active Attack Probes:** Dynamic payloads checking for SQLi, XSS, Path Traversal, OS Command Injection, SSTI, basic/OAuth auth vulnerabilities, and exposed configuration files.
* **Vulnerability Intelligence Factory:** Maps discoveries against a **369-entry vulnerability catalog** (CWE/OWASP/CVSS-mapped), auto-generates severities, cvss scores, and remediation guides.

### 📊 2. High-Tech Cybersecurity Dashboard
* **Dynamic Attack Surface Map:** Dynamically parses crawled target routes, groups them on-the-fly into microservices (e.g., `watch`, `search`, `login` based on target site), maps connectors, and color-codes nodes based on live scanner risk outputs (Red = Vulnerable, Orange = Warning, Green = Protected).
* **Retro CRT Terminal Scanner Logs:** Displays real-time scan event logs inside an animated hacker-terminal screen with scanlines and a blinking green terminal cursor.
* **Scan Status Tracker:** Visualizes live scan pipelines (Recon → Discovery → Authentication → Testing → Reporting) with glowing rings, progress percentages, and status alerts.
* **Unified Metrics KPI widgets:** Displays total findings, critical threat levels, vulnerability trends, heatmaps, and security grades (A+ to F).

### 🤖 3. AI Security Copilot (Vulnerability Analyst)
* **LLM Vulnerability Analysis:** Sends any discovered threat to OpenRouter models to produce structured executive summaries, technical impact lists, realistic attack scenarios, and remediation blueprints.
* **PDF Report Compilation:** Puppeteer-rendered PDF narrative compiler for instant vulnerability report downloads.

---

## 🚧 Ongoing Work (In Progress)
* **Scheduled Background Scanning:** Implementing recurring cron schedules (daily, weekly, monthly) for automated passive assessments.
* **CSV Export:** Mapping CSV parser stubs in the reports controller to allow raw spreadsheet exports.
* **Full-Scan PDF Report:** Consolidating all scan vulnerabilities into a unified PDF report template.

---

## 🔭 Future Work & Roadmap
* **Multi-Tenant Teams:** Shared workspaces, role-based resource scopes, and audit logging for organizations.
* **Alert Integrations:** Direct vulnerability webhook reporting to Slack, Discord, and Jira.
* **Stripe Billing:** Subscription tiers, metered usage plans, and trial bounds.
* **Job Queues:** Offloading scanning workloads to BullMQ/Redis background processes.

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
      reports/        → PDF/JSON reporting utilities
      dashboard/      → Stats aggregation query handlers
      ai/             → AI narrative generator backed by OpenRouter LLMs

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

### Prerequisites
* Node.js (v18+)
* MongoDB (Local or Atlas URI)
* OpenRouter API Key (For AI Copilot)

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

---

## 🛡️ Git Hygiene Note
All components have been verified locally. Run `npm run build` inside `frontend/` to build the production build. Make sure to commit the current work to your `dev` branch prior to deployment staging.
