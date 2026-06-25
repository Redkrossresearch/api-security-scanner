# API Security Scanner (ATHX)

An enterprise-style API security assessment platform. Users submit a target URL, the backend runs a battery of live security scanners against it, findings are scored and stored, and results surface through a React dashboard — including an AI-powered "explain this vulnerability" copilot.

**Stack:** Node.js / Express 5 / MongoDB (Mongoose) backend · React 19 / Vite / Tailwind frontend · OpenRouter (LLM) for AI analysis · Firebase Auth (partial, frontend-only) alongside a custom JWT auth system.

**Branch:** `dev` (2 commits ahead of a minimal `main`; most of the work described below exists only in the working tree / `dev` branch and has not yet been committed — see [Git Hygiene](#git-hygiene-note)).

---

## Table of Contents

1. [What This Project Does](#what-this-project-does)
2. [Architecture Overview](#architecture-overview)
3. [✅ Completed & Working](#-completed--working)
4. [🚧 In Progress / Partially Built](#-in-progress--partially-built)
5. [🐛 Known Bugs & Inconsistencies](#-known-bugs--inconsistencies)
6. [⛔ Not Started](#-not-started)
7. [🔭 Future Work / Roadmap](#-future-work--roadmap)
8. [API Reference (Current)](#api-reference-current)
9. [Setup](#setup)
10. [Git Hygiene Note](#git-hygiene-note)

---

## What This Project Does

A user registers/logs in, submits a target API/URL, and the backend fires **23 scanners in parallel** against it — header checks, SSL/TLS validation, CORS/cookie checks, technology fingerprinting, and live attack-style probes for SQL/NoSQL/LDAP/XPath/command injection, XSS, SSRF, file upload flaws, auth/access-control weaknesses, cloud misconfig, business logic issues, crypto weaknesses, supply-chain risk, and more. Findings are normalized against a **369-entry vulnerability catalog** (CWE/OWASP/CVSS-mapped), scored into an overall security score/grade/risk level, and persisted. Results are visualized on a dashboard, and any individual finding can be sent to an LLM (via OpenRouter) for a structured, exportable AI security report.

---

## Architecture Overview

```
backend/
  src/
    modules/
      auth/         → JWT register/login/refresh/logout (email+password)
      scans/        → Scan model/controller/service — the orchestration core
      scanner/       → 23 active scanner implementations (+ unused refactor scaffolding)
      engines/       → CVSS, severity, risk, security-score calculation
      vulnerabilities/ → 369-entry catalog, factory (raw finding → enriched finding), model
      reports/       → JSON/PDF report generation (CSV is a stub)
      dashboard/     → /api/dashboard/stats (the dashboard's main data source)
      ai/            → OpenRouter integration for per-vulnerability AI analysis
      history/       → ⛔ entirely unimplemented (analytics/forecast) — all files empty
    middleware/      → auth, role/authorize (duplicated), rate limiting, validation
    config/          → env, db connection

frontend/
  src/
    pages/           → Dashboard (live), Scans (UI mockup), History (static),
                       Vulnerabilities/Reports/Settings (placeholders)
    components/
      dashboard/     → live-data widgets + the AI "Analyze" modal (fully wired)
      scans/         → large, polished, but mostly static/no-data-fetching scan UI
      ai/            → 7 cards rendering structured AI analysis output
      auth/          → Google sign-in button + Firebase context (not linked to backend)
```

The **scan orchestration** (`backend/src/modules/scans/scan.service.js`) is the heart of the system: it runs all scanners with `Promise.all`, aggregates findings, computes severity counts and a weighted risk score, saves findings to a dedicated `Vulnerability` collection (deliberately *not* embedded in the `Scan` document, to avoid MongoDB's 16MB document-size limit on large scans), and triggers report generation.

---

## ✅ Completed & Working

### Authentication & Authorization (email/password)
- Register, login, JWT access + refresh tokens, refresh rotation, logout (single device + all devices), protected routes, role-based admin route (`authorize("admin")`).
- Rate limiting on `/api/auth/*` (20 req / 15 min) and globally on `/api/*` (300 req / 15 min).

### Scan Engine — 23 live scanners, run in parallel per scan
| Category | Scanners |
|---|---|
| Passive/config checks | Security headers, SSL/TLS, CORS, cookies, server disclosure, technology fingerprinting |
| API surface | OpenAPI spec analysis, API inventory, attack surface mapping, endpoint risk scoring, rate-limit testing |
| Active attack probes | Injection (SQL, blind/error-based SQLi, NoSQL, LDAP, XPath, OS command, code, SSTI, eval), XSS, file upload, authentication, access control, business logic, network, cryptography, supply chain, generic web attacks |

These send real payloads/requests at the target and pattern-match responses (e.g. SQL error signatures, timing-based blind injection, command output leakage) — this isn't just passive metadata sniffing.

### Vulnerability Intelligence Layer
- **369 cataloged vulnerability types** across 18 categories (Injection, Access Control, Cryptography, Cloud Security, Supply Chain, Business Logic, etc.), each mapped to CWE, OWASP category, CVSS, and remediation steps.
- A factory (`vulnerability.factory.js`) normalizes raw scanner output into a consistent finding shape (severity, risk, business impact, exploitability, fix complexity, evidence, compliance tags).

### Scoring & Risk Engines
- `security-score.engine.js`, `severity-engine.js`, `risk-engine.js`, `cvss-engine.js` — produce a 0–100 score, letter grade, risk level, and a weighted 0–10 risk score per scan.

### Dashboard (backend + frontend, live)
- `GET /api/dashboard/stats` is fully implemented and the `DashboardPage.jsx` is genuinely wired to it (not mocked) — fetches on load, renders KPI cards, severity chart, trend chart, latest scans table, top findings.

### AI Security Copilot (per-finding analysis) — fully wired end-to-end
- Frontend "Analyze" action → `vulnerabilityService.analyzeVulnerability()` → `POST /api/ai/analyze` → OpenRouter (`openai/gpt-oss-120b:free`) with a structured system prompt + output schema → JSON parsed into Verdict / Executive Summary / Business Impact / Technical Analysis / Attack Scenario / Remediation Plan / References cards.
- Includes a working **PDF export** of the AI analysis (`POST /api/ai/export-pdf`, Puppeteer-rendered HTML template).
- This is the most complete "new" feature in the project — genuinely functional, not a placeholder.

### Reporting (partial — see below for the incomplete part)
- Report model/service/controller; **JSON export works**; **PDF export of the AI analysis works**.

---

## 🚧 In Progress / Partially Built

- **CSV report export** — route exists (`GET /api/reports/:scanId/export/csv`) but the controller just returns `{ message: "CSV export working" }`. No actual CSV is generated.
- **Full-scan PDF report export** — see [bug #2](#-known-bugs--inconsistencies) below; currently broken due to an argument mismatch, even though the underlying Puppeteer/template pipeline is built.
- **Scan History page** — has a polished UI (drawer, comparison modal, KPI cards, trend charts) but no data-fetching logic; `scanService.js` (frontend) is empty, so it's currently rendering without a live backend connection.
- **Scan Execution page** — visually the most built-out page (endpoint discovery table, live scanner logs, attack surface map, findings panel, request/response inspector, AI analyst panel) but every one of those components is static — no `useState`/`useEffect`/API calls found in any of them. This is currently a UI mockup of what live scan execution should look like, not a working live view.
- **Google / Firebase login** — `firebase.js` + `AuthContext` implement a working `signInWithPopup` Google flow and gate routes via `ProtectedRoute`, but this is entirely disconnected from the backend's JWT system. There's no backend endpoint that accepts a Firebase ID token, and the API client (`api.js`) reads its bearer token from `localStorage.getItem("token")`, which nothing currently sets. **Net effect: logging in with Google unlocks the frontend routes but every backend-authenticated API call will fail.**
- **Dashboard-style endpoints on `/api/scans/dashboard/*`** — `getDashboardSummary`, `getRiskDistribution`, `getScanActivity`, `getVulnerabilityTrends`, `getAssetLeaderboard`, `getHeatmap`, `getAIInsights` are implemented and registered, but are explicitly commented `// DASHBOARD ROUTES (NO AUTH - DEV MODE)` — most are not behind the `authenticate` middleware yet (only `getAssetLeaderboard` requires auth). This looks like a deliberate "wire it later" shortcut rather than an oversight, but it means these currently leak per-user scan data to unauthenticated requests if `req.user` resolution is bypassed or stubbed.

---

## 🐛 Known Bugs & Inconsistencies

These are concrete defects found while reading the code, not stylistic nitpicks:

1. **Three analytics endpoints will always return empty/zero data.** `getDashboardSummary`, `getHeatmap`, and `getAIInsights` (in `scan.controller.js`) all run MongoDB aggregations that `$unwind: "$vulnerabilities"` on the `Scan` document. But `scan.service.js` explicitly stops populating that field (there's a comment: *"REMOVED: scan.vulnerabilities = findings; Reason: ... will cause MongoDB 16MB document limit crash"*) — findings are now only saved to the separate `Vulnerability` collection. So `$unwind` on an array that's always `[]` silently produces no rows. These three endpoints need to be rewritten to query the `Vulnerability` collection instead (the way `getDashboardSummary`'s sibling, `getRiskDistribution`, correctly does by reading the flattened `criticalCount`/`highCount`/etc. fields directly off `Scan`).
2. **Full-scan PDF export is broken.** `report.controller.js`'s `exportPdfReport` calls `generatePdfReport(report, res)`, but `pdfReport.service.js`'s `generatePdfReport` signature is `(vulnerability, analysis, res)` — so `res` is passed into the `analysis` parameter and the real `res` is `undefined` inside the function, meaning `res.send(pdfBuffer)` will throw. (The AI module's own PDF export, `ai.controller.js`, calls the same function correctly with 3 arguments — so the function itself is fine, just one of its two call sites is wrong.)
3. **Duplicate middleware.** `authorize.middleware.js` and `role.middleware.js` are functionally identical (both implement the same role-check signature). Only `authorize.middleware.js` appears to be imported anywhere; `role.middleware.js` looks like dead code from an earlier naming pass.
4. **Debug logging left in auth middleware.** `auth.middleware.js` logs the raw `Authorization` header, the extracted token, and the decoded JWT payload to the console on every request. Harmless in dev, but should be removed before any shared/staging deployment — it's printing bearer tokens to logs.
5. **`.env.example` is out of date.** `env.js` reads `OPENROUTER_API_KEY` and `OPENROUTER_MODEL`, but `.env.example` only lists `NODE_ENV`, `PORT`, `MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `CLIENT_URL`. Anyone cloning the repo and copying `.env.example` will have a working server but a silently-failing AI feature.
6. **Hardcoded values instead of env vars.** Firebase config is hardcoded in `frontend/src/firebase.js` (not a secret-leak concern for a Firebase *web* API key, but inconsistent with how the rest of the app is configured), and `vulnerabilityService.js` hardcodes `http://localhost:5000/api` instead of reusing the existing `api.js` axios instance (which already respects `VITE_API_URL`). This will break in any non-local deployment unless caught.
7. **Confusingly similar filenames.** `report-narrative-generator.js` and `report-narrative.generator.js` are *not* duplicates — the first builds the JSON narrative export shape (used by `report.service.js`), the second builds executive-summary text (used by `report.generator.js`) — but the near-identical names invite future confusion or accidental edits to the wrong file. Worth renaming one of them.
8. **Sidebar links to four pages that don't exist.** The sidebar (`Sidebar.jsx`) has nav entries for `/inventory` ("API Inventory"), `/copilot` ("AI Copilot"), `/compliance` ("Compliance"), and `/audit-logs` ("Audit Logs") — none of these paths are registered in `App.jsx`'s router, so clicking them currently goes nowhere (no matching `<Route>`).
9. **Leftover stub endpoint from an earlier, fake version of the AI feature.** `POST /api/vulnerabilities/analyze` (`vulnerability.controller.js`) is hardcoded — its own comment admits *"Placeholder for actual vulnerability analysis logic"* — and just echoes back templated strings built from the request body. It's been superseded by the real `POST /api/ai/analyze` (OpenRouter-backed) that the frontend actually calls. Nothing currently calls the old route; safe to delete along with its registration in `vulnerability.routes.js`.

---

## ⛔ Not Started

These exist only as empty scaffold files (0 lines) or are simply absent — they represent deliberate placeholders for planned architecture, not accidental gaps:

- **`history` module — completely empty.** `history.controller.js`, `history.service.js`, `history.analytics.js`, `history.forecast.js`, `history.routes.js` all exist but contain zero lines, and the module is **not even registered** in `app.js`. This is presumably intended to eventually own scan-history analytics and forecasting (trend prediction over time), separate from the dashboard's current-state stats.
- **Scanner refactor scaffolding — empty.** `scanner/analyzers/*` (cors, header, jwt, network, ssl, technology), `scanner/detectors/*` (cors, header, jwt, ssl), `scanner/evidence/*` (builder, header, request, response), `scanner/payloads/*` (command, graphql, ldap, nosql, sql, ssrf, xpath, xss), `scanner/engine/scanner.engine.js`, and `scanner/registry/scanner.registry.js` are all 0-line files. This looks like the start of a planned move toward a more modular analyzer/detector/evidence-builder pattern with externalized payload libraries and a central scanner registry — but none of the current 23 working scanners have been migrated to it yet, and `auth.scanner.js` (also empty) is presumably meant to become a dedicated authentication-flow scanner.
- **CSV report generation** — stub only (see bugs/in-progress above).
- **Frontend `RegisterForm.jsx`, `ForgotPasswordModal.jsx`** — empty components; no registration or password-reset UI exists yet despite the backend supporting registration.
- **`ExportReportButton.jsx`, `VulnerabilityChart.jsx`, `DashboardAIInsights.jsx`, `AIRiskAnalysis.jsx`, `PageHeader.jsx`, root `VulnerabilityModal.jsx`** — empty placeholder components, not yet implemented.
- **No CI/CD.** `.github/` exists in the repo but contains no workflow files.
- **No automated tests run in practice.** `jest`/`supertest` are installed (backend `devDependencies`) and `npm test` is wired up, but only one near-empty file exists at `backend/src/modules/auth/test.js` (3 lines) — there is effectively no test coverage yet.

---

## 🔭 Future Work / Roadmap

Carried forward from the project's own prior planning docs (`ROADMAP.md` / `PROJECT_STATE.md`, both present in git history but removed from the current working tree) and updated against what's actually been built since:

| Phase | Scope | Status |
|---|---|---|
| Reporting completion | CSV export, fix PDF export bug, executive report templates, report sharing | 🚧 Partial — JSON done, PDF broken, CSV stub |
| Scan History & Vulnerabilities pages | Wire the existing rich UIs to real data | ⛔ Not started (UI built, data layer missing) |
| Unify authentication | Connect Firebase Google login to backend sessions, or drop one of the two auth systems; add password reset & registration UI | ⛔ Not started |
| `history` analytics module | Historical trend analysis, forecasting (file scaffolding exists) | ⛔ Not started |
| Scanner architecture refactor | Migrate scanners to analyzer/detector/evidence/registry pattern; externalize attack payloads into the `payloads/` library | ⛔ Scaffolded only |
| API Inventory page | Surface the `api-inventory.scanner.js` data in a dedicated UI (sidebar already links here) | ⛔ Not started |
| Standalone AI Copilot page | A dedicated `/copilot` experience beyond the per-finding modal (sidebar already links here) | ⛔ Not started |
| Compliance & Audit Logs pages | Sidebar links exist; no backend or frontend implementation | ⛔ Not started |
| Email & notifications | Email verification, OTP password reset, scan-completion emails, weekly summaries | ⛔ Not started |
| Scheduled scanning | Recurring (daily/weekly/monthly) scans, scheduled reports | ⛔ Not started |
| Enterprise features | Organizations, teams, shared workspaces, multi-tenant architecture | ⛔ Not started |
| Billing | Stripe integration, plan tiers, usage tracking, feature gating | ⛔ Not started |
| Production hardening | API keys, webhooks, job queue/background workers, monitoring, error tracking, audit logs, Docker/K8s readiness, lock down the currently-unauthenticated dashboard routes | ⛔ Not started |

---

## API Reference (Current)

| Method | Route | Auth | Status |
|---|---|---|---|
| POST | `/api/auth/register` | – | ✅ |
| POST | `/api/auth/login` | – | ✅ |
| POST | `/api/auth/refresh` | – | ✅ |
| GET | `/api/auth/profile` | ✅ | ✅ |
| POST | `/api/auth/logout` | ✅ | ✅ |
| POST | `/api/auth/logout-all` | ✅ | ✅ |
| GET | `/api/auth/admin-test` | ✅ (admin) | ✅ |
| POST | `/api/scans` | ✅ | ✅ Runs full 23-scanner pipeline |
| GET | `/api/scans` | ✅ | ✅ |
| GET | `/api/scans/history` | ✅ | ✅ |
| GET | `/api/scans/:id` | ✅ | ✅ |
| DELETE | `/api/scans/:id` | ✅ | ✅ |
| GET | `/api/scans/dashboard/summary` | ⚠️ none | 🐛 broken (see bug #1) |
| GET | `/api/scans/dashboard/risk-distribution` | ⚠️ none | ✅ |
| GET | `/api/scans/dashboard/activity` | ⚠️ none | ✅ |
| GET | `/api/scans/dashboard/vulnerability-trends` | ⚠️ none | ✅ |
| GET | `/api/scans/dashboard/leaderboard` | ✅ | ✅ |
| GET | `/api/scans/dashboard/heatmap` | ⚠️ none | 🐛 broken (see bug #1) |
| GET | `/api/scans/dashboard/ai-insights` | ⚠️ none | 🐛 broken (see bug #1) |
| GET | `/api/dashboard/stats` | – | ✅ Primary dashboard data source |
| GET | `/api/vulnerabilities/:id` | – | ✅ |
| POST | `/api/vulnerabilities/analyze` | – | 🐛 dead stub (see note) |
| GET | `/api/reports/:scanId` | – | ✅ |
| GET | `/api/reports/:scanId/export/json` | – | ✅ |
| GET | `/api/reports/:scanId/export/csv` | – | 🚧 stub |
| GET | `/api/reports/:scanId/export/pdf` | – | 🐛 broken (see bug #2) |
| POST | `/api/ai/analyze` | – | ✅ Used by frontend AI copilot |
| POST | `/api/ai/export-pdf` | – | ✅ |

> Note: `vulnerability.controller.js`'s `analyzeVulnerability` (`POST /api/vulnerabilities/analyze`) is a leftover hardcoded stub — its own source comment says *"Placeholder for actual vulnerability analysis logic"* — that returns templated strings built from whatever fields the caller sent (e.g. `executiveSummary: "This vulnerability has been identified as ${severity} severity..."`). It predates the real AI Copilot work and has been superseded by `POST /api/ai/analyze` (OpenRouter-backed, actually used by the frontend). Nothing currently calls this route; it's a safe candidate for deletion alongside its route registration.

---

## Setup

```bash
# Backend
cd backend
npm install
cp .env.example .env   # then fill in MONGODB_URI, JWT secrets, CLIENT_URL,
                        # AND ADD: OPENROUTER_API_KEY, OPENROUTER_MODEL (not in .env.example yet — see bug #5)
npm run dev             # nodemon, http://localhost:5000

# Frontend
cd frontend
npm install
npm run dev              # vite, http://localhost:5173
```

---

## Git Hygiene Note

`git status` on this checkout shows the *vast majority* of the current codebase — the entire `scanner/`, `engines/`, `reports/`, `vulnerabilities/`, `dashboard/`, `history/`, `ai/` backend modules, and most of the frontend `components/`, `pages/`, `contexts/`, `routes/`, `constants/`, `services/`, `styles/` — as **untracked or uncommitted** against the `dev` branch's last commit (`5da72c9`, "stabilize dashboard ui and ai copilot"). Only 2 commits exist in the whole repo. Recommend committing the current working state (ideally split into a few logical commits — e.g. "scanner suite," "AI copilot," "reporting") before doing anything else, so this snapshot isn't at risk of being lost and so future changes are reviewable.
