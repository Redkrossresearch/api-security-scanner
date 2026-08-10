<div align="center">

<img src="https://img.shields.io/badge/ATHX_SECURITY-PLATFORM-0F172A?style=for-the-badge&logoColor=F97316&labelColor=060910" height="36"/>

# ATHX Security — Enterprise AI API Security Platform

**_"Find. Understand. Fix. Before attackers do."_**

[![Live Demo](https://img.shields.io/badge/🌐_LIVE_DEMO-api--security--scanner--mauve.vercel.app-F97316?style=for-the-badge)](https://api-security-scanner-mauve.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Render_Production-38BDF8?style=for-the-badge&logo=render)](https://api-security-scanner-puum.onrender.com)
[![Status](https://img.shields.io/badge/STATUS-PRODUCTION_STABLE-10B981?style=for-the-badge&logo=checkmarx)](https://github.com/Redkrossresearch/api-security-scanner)

[![React 19](https://img.shields.io/badge/React-19.x-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=flat-square&logo=vite)](https://vite.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-24.x-339933?style=flat-square&logo=nodedotjs)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![BullMQ](https://img.shields.io/badge/Queue-BullMQ_+_Redis-FF4444?style=flat-square&logo=redis)](https://bullmq.io/)
[![Socket.IO](https://img.shields.io/badge/Realtime-Socket.IO-010101?style=flat-square&logo=socket.io)](https://socket.io/)
[![Gemini](https://img.shields.io/badge/AI-Gemini_+_Groq-8B5CF6?style=flat-square&logo=google)](https://ai.google.dev/)

</div>

---

## 🎯 Main Mission

> **ATHX Security is an autonomous, AI-powered API security platform that scans any web application for vulnerabilities, enriches findings with live threat intelligence from the internet, and delivers AI-generated fixes — all in real time.**

Most security tools tell you *what* is broken. ATHX tells you **what it is, how severe it is, where it came from, and exactly how to fix it** — with code patches, compliance mappings, and cryptographic audit reports ready to share with your team.

Built for developers, security engineers, and DevSecOps teams who need deep API security without a six-figure enterprise contract.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           ATHX SECURITY PLATFORM                                │
│                                                                                 │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                    React 19 + Vite Frontend (Vercel)                     │  │
│  │   Dashboard │ Scans │ Inventory │ Copilot │ Reports │ Queue │ Settings   │  │
│  └────────────────────────────────┬─────────────────────────────────────────┘  │
│                                   │ REST + WebSocket                            │
│  ┌────────────────────────────────▼─────────────────────────────────────────┐  │
│  │                   Node.js / Express Backend (Render)                      │  │
│  │                                                                           │  │
│  │  ┌─────────────────┐  ┌──────────────────┐  ┌───────────────────────┐  │  │
│  │  │  Auth & RBAC    │  │  52-Scanner DAST  │  │  Threat Intel Module  │  │  │
│  │  │  Firebase+JWT   │  │  Engine (Parallel) │  │  Vulners│NVD│Shodan  │  │  │
│  │  └─────────────────┘  └────────┬─────────┘  │  VirusTotal (Live)    │  │  │
│  │                                │             └───────────────────────┘  │  │
│  │  ┌─────────────────┐  ┌────────▼─────────┐  ┌───────────────────────┐  │  │
│  │  │  BullMQ + Redis │  │  Vulnerability   │  │  AI Copilot           │  │  │
│  │  │  Task Queue     │◄─│  Catalog (8137+  │  │  Gemini│Groq│RAG      │  │  │
│  │  │  Worker Monitor │  │  entries)         │  │  DAG Knowledge Graph  │  │  │
│  │  └─────────────────┘  └──────────────────┘  └───────────────────────┘  │  │
│  │                                                                           │  │
│  │  ┌──────────────────────────────────────────────────────────────────┐   │  │
│  │  │                    MongoDB Atlas Database                         │   │  │
│  │  │   Scans │ Users │ Settings │ Vulnerabilities │ Inventory │ Logs  │   │  │
│  │  └──────────────────────────────────────────────────────────────────┘   │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Scan Execution Flow

```
User submits target URL
         │
         ▼
┌─────────────────┐     ┌──────────────────────────────────────────────────┐
│  Web Crawler    │────►│  Tech Stack Detection (PHP/Apache/Nginx/Node.js) │
│  & JS AST Parse │     └───────────────────┬──────────────────────────────┘
└─────────────────┘                         │
                                            ▼
                         ┌──────────────────────────────────────────────┐
                         │       PARALLEL EXECUTION (Promise.all)        │
                         │                                                │
                         │  ┌─────────────┐  ┌──────────────────────┐  │
                         │  │ 52 DAST     │  │  Threat Intel APIs   │  │
                         │  │ Scanners    │  │  ┌──────────────────┐ │  │
                         │  │             │  │  │ Vulners → CVEs   │ │  │
                         │  │ BOLA│JWT   │  │  │ Shodan → Ports   │ │  │
                         │  │ SSRF│XXE   │  │  │ VirusTotal→Malwr │ │  │
                         │  │ SQLi│XSS   │  │  │ NVD → CVSS Score │ │  │
                         │  │ CORS│...   │  │  └──────────────────┘ │  │
                         │  └──────┬──────┘  └──────────┬───────────┘  │
                         └─────────┼────────────────────┼───────────────┘
                                   │                    │
                                   ▼                    ▼
                         ┌──────────────────────────────────────┐
                         │   Merge + Deduplicate by CVE ID       │
                         │   NVD CVSS Enrichment (Background)    │
                         └──────────────────┬───────────────────┘
                                            │
                                            ▼
                         ┌──────────────────────────────────────┐
                         │   AI Analysis & Code Patch Generator  │
                         │   Gemini / Groq + RAG Vector Store    │
                         └──────────────────┬───────────────────┘
                                            │
                                            ▼
                         ┌──────────────────────────────────────┐
                         │   PDF Report + SHA256 Audit Diploma   │
                         │   OWASP / PCI-DSS / SOC2 Compliance  │
                         └──────────────────────────────────────┘
```

---

## ✨ Full Feature Breakdown

### 🛡️ 1. 52-Scanner Parallel DAST Engine

The core of ATHX — **52 specialized Dynamic Application Security Testing probes** running concurrently via `Promise.all`. Every probe is an independent module that fires real HTTP requests against the target.

| Category | Scanners |
|---|---|
| **Injection** | SQL Injection, NoSQL Injection, Command Injection, LDAP Injection, XPath Injection, SSTI |
| **Auth & Access** | BOLA/IDOR, BFLA, JWT Weak Secret, JWT Algorithm Confusion, OAuth Misconfiguration |
| **Headers & Config** | CORS, CSP Eval, HSTS, Clickjacking, Referrer Policy, Content-Type Sniffing, Security Headers |
| **Data Exposure** | Server Header Disclosure, Env File Exposure, Git Exposure, Swagger Exposure, Exposed Files |
| **Injection Advanced** | SSRF, XXE, Path Traversal, HTTP Smuggling, Mass Assignment, Prototype Pollution, Open Redirect |
| **Network** | SSL/TLS Config, Redis Exposure, Cloud Metadata, Subdomain Takeover, Rate Limiting |
| **API Specific** | GraphQL Introspection, gRPC Security, WebSockets, API Versioning, Cookie Security |
| **Discovery** | Attack Surface Mapping, Endpoint Risk Scoring, Directory Bruteforce, Technology Fingerprinting |

```
Each finding includes:
  ✔ CVSS 3.1 Base Score
  ✔ CWE / OWASP Top 10 mapping
  ✔ Severity: Critical / High / Medium / Low / Info
  ✔ Reproduction steps
  ✔ AI-generated code fix
```

---

### 🌐 2. Live Threat Intelligence Integration

**Sources queried in parallel on every scan.** If any source is down → instant fallback to internal catalog with zero latency.

```
┌──────────────┬─────────────────────────────────────────────────────────────┐
│   Source     │ What it does                                                │
├──────────────┼─────────────────────────────────────────────────────────────┤
│  🔴 Vulners  │ Finds all known CVEs for detected software (PHP, Apache...) │
│  🟠 Shodan   │ Scans open ports, exposed services, host-level CVEs         │
│  🟢 Virus-   │ Checks domain/URL/IP against 70+ antivirus engines          │
│     Total    │                                                             │
│  🔵 NVD      │ Authoritative CVSS v3.1 scores for every CVE found          │
├──────────────┼─────────────────────────────────────────────────────────────┤
│  📁 Catalog  │ 8,137+ entry internal vuln database (instant, always works) │
└──────────────┴─────────────────────────────────────────────────────────────┘
```

**NVD is the authoritative CVSS source** — it enriches ALL CVEs whether they came from live sources or the catalog. Catalog scores get updated in background.

**New API endpoints:**
```
POST /api/threat-intel/scan           → Full scan all sources
GET  /api/threat-intel/cve/:cveId    → NVD CVE details
GET  /api/threat-intel/shodan/:host  → Shodan host scan
GET  /api/threat-intel/virustotal/:t → VirusTotal scan
GET  /api/threat-intel/vulners/:sw   → Vulners CVE search
```

---

### 🧠 3. Multi-Agent AI Security Copilot

A multi-model AI assistant that understands your scan results and generates actionable fixes.

```
User Query
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│                    AI Copilot Pipeline                       │
│                                                             │
│  RAG Vector Store ──► Relevant scan history + vuln catalog  │
│  DAG Knowledge Graph → OWASP/CWE root-cause traversal       │
│  Live Web Search ───► Latest CVEs, zero-days, advisories    │
│  AI Critic Loop ────► Self-evaluates answer quality         │
│                                                             │
│  LLM Options: Gemini Flash │ Groq LPU │ OpenRouter          │
└──────────────────────────────────┬──────────────────────────┘
                                   │
                                   ▼
           Code patch + explanation + compliance reference
```

**Capabilities:**
- 💬 Natural language vulnerability Q&A
- 🔧 Drop-in Node.js / Express security patches with before/after diffs
- 📎 Clickable citation cards from NIST, OWASP, CVE databases
- 🖼️ Attack diagram generation
- 🧠 Learns from your previous scan history via RAG

---

### 📊 4. Real-Time Dashboard & Telemetry

```
┌──────────────────────────────────────────────────────────────────┐
│  Live Dashboard KPIs                                             │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │  Total   │  │  Active  │  │  Critical│  │  Compliance  │   │
│  │  Scans   │  │  Threats │  │  CVEs    │  │  Score       │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘   │
│                                                                  │
│  📈 Trend charts (7-day, 30-day vulnerability history)           │
│  🔴 Live Threat Feed (real-time WebSocket events)                │
│  🌍 Attack origin map                                            │
│  📋 Recent scan activity log                                     │
└──────────────────────────────────────────────────────────────────┘
```

---

### 🚀 5. BullMQ Worker Queue Monitor (`/queue`)

Real-time scan job management with full-width telemetry display.

```
┌─────────────────────────────────────────────────────────────────┐
│   BullMQ Worker Thread Pool — 8 Slots                           │
│                                                                 │
│  [PROCESSING] [IDLE] [IDLE] [PROCESSING] [IDLE] [IDLE] [IDLE] [FAILED] │
│                                                                 │
│  📟 Live Terminal Log Stream (WebSocket)                        │
│  scan:start → scan:progress → scan:completed / scan:failed      │
│                                                                 │
│  [Re-Queue] [Export CSV] [View Payload] [Error Trace]           │
└─────────────────────────────────────────────────────────────────┘
```

---

### 🎯 6. API Inventory & Endpoint Discovery (`/inventory`)

```
Input: https://target-api.com
         │
         ▼
   JS Bundle Download → AST Parsing → Route Extraction
         │
         ▼
   ┌─────────────────────────────────────────────┐
   │  Discovered Endpoints                        │
   │  api.target.com/users          [HIGH RISK]  │
   │  api.target.com/admin/export   [CRITICAL]   │
   │  api.target.com/payments/:id   [HIGH RISK]  │
   └──────────────────────┬──────────────────────┘
                          │
                          ▼
              OpenAPI 3.0 Spec Export (JSON)
              Endpoint Risk Score per route
              Host grouping + risk badges
```

---

### 📜 7. Reports & Cryptographic Audit Diplomas (`/reports`)

| Format | Contents |
|---|---|
| **PDF** | Executive summary, CVSS breakdown, attack vector diagrams, compliance scores |
| **DOCX** | Word-compatible security audit report |
| **CSV** | Tabular vulnerability data for spreadsheet analysis |
| **JSON/YAML** | Machine-readable findings for CI/CD pipelines |
| **ZIP** | All formats bundled |
| **Diploma** | Printable certificate with SHA256 seal + HMAC signature |

---

### ⚙️ 8. Settings Control Center (`/settings`)

15 persistent MongoDB settings with real-time theme propagation:

| Category | Settings |
|---|---|
| **Profile** | `username`, `email`, `avatarUrl`, `orgHandle` |
| **Appearance** | `themeMode` (4 themes), `accentColor`, `compactMode`, `soundEnabled` |
| **Scanner** | `crawlDepth`, `rateLimit`, `subdomainDiscovery`, `piiMasking` |
| **Security** | `twoFactorAuth`, `webhookUrl`, `logRetentionDays` |

**Theme change → emits `athx-settings-updated` event → CSS root variables mutate site-wide instantly (no reload).**

---

## 🗂️ Project Structure

```
api-security-scanner/
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── ai/              # AI analysis, PDF export, Gemini/Groq adapters
│   │   │   ├── agents/          # Autonomous agent roster (Planner, Fixer, Judge)
│   │   │   ├── auth/            # JWT auth, Google OAuth, RBAC middleware
│   │   │   ├── copilot/         # RAG conversation controller
│   │   │   ├── dashboard/       # KPI stats, activity logs endpoints
│   │   │   ├── engines/         # CVSS engine, Risk engine, Severity engine
│   │   │   ├── inventory/       # Target crawling, endpoint discovery, OpenAPI export
│   │   │   ├── llm/             # RAG vector store, reranker, DAG graph, external sources
│   │   │   ├── queue/           # BullMQ worker status, diagnostics routes
│   │   │   ├── reports/         # PDF/DOCX/CSV/JSON report builder + crypto certs
│   │   │   ├── scanner/         # ← 52 DAST scanner modules live here
│   │   │   ├── scans/           # Scan orchestration, attack graph, WebSocket telemetry
│   │   │   ├── settings/        # 15-field settings schema + MongoDB persistence
│   │   │   ├── threat-intel/    # ← NEW: Vulners, NVD, Shodan, VirusTotal services
│   │   │   └── vulnerabilities/ # 8,137+ entry vuln catalog + factory
│   │   ├── middleware/          # Rate limiter, request logger, auth middleware
│   │   ├── config/              # DB, env, CORS utilities
│   │   └── sockets/             # Socket.IO server for real-time scan events
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ai/              # Attack diagram cards, AI analysis panels
│   │   │   ├── copilot/         # Chat UI, citation cards, message renderers
│   │   │   ├── dashboard/       # KPI cards, trend charts, threat feed
│   │   │   ├── inventory/       # Endpoint inspector drawer, WebsiteFavicon
│   │   │   ├── layouts/         # Sidebar (with Google avatar), GlobalTopBar
│   │   │   └── scans/           # Live scanner log, AttackSurfaceMap, findings
│   │   ├── contexts/            # AuthContext (Firebase + JWT token exchange)
│   │   ├── pages/               # Scans, History, Copilot, Reports, Queue, Settings
│   │   ├── services/            # Axios client (120s timeout, auto Vercel fallback)
│   │   └── sockets/             # Socket.IO client + ConnectionStatus badge
│   ├── public/                  # favicon.ico
│   └── index.html
├── docs/
│   └── diagrams/                # Contribution breakdown, timeline, branch flow charts
├── collaboration_log.md         # Full 224-commit sprint registry + author attribution
├── vercel.json                  # Production SPA rewrite config
└── README.md
```

---

## 📡 Complete API Reference

### Auth
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/google-login` | Google OAuth → JWT token exchange |
| `POST` | `/api/auth/register` | Email/password registration |
| `POST` | `/api/auth/login` | Email/password login |
| `POST` | `/api/auth/logout` | Invalidate session |

### Scans
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/scans/start` | Launch 52-scanner parallel DAST audit |
| `GET` | `/api/scans` | List all scans with status |
| `GET` | `/api/scans/:id` | Full scan detail (findings, CVSS, telemetry) |
| `POST` | `/api/scans/:id/reaudit` | Re-queue existing scan |
| `DELETE` | `/api/scans/:id` | Delete scan record |

### Threat Intelligence _(NEW)_
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/threat-intel/scan` | Full scan — all sources + catalog + NVD enrichment |
| `GET` | `/api/threat-intel/cve/:cveId` | NVD official CVE details + CVSS v3.1 |
| `GET` | `/api/threat-intel/shodan/:host` | Shodan open ports + host CVEs |
| `GET` | `/api/threat-intel/virustotal/:target` | VirusTotal domain/URL/IP reputation |
| `GET` | `/api/threat-intel/vulners/:software` | Vulners CVE search by software name |

### AI & Copilot
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/ai/analyze` | AI vulnerability analysis + code fix |
| `POST` | `/api/ai/export-pdf` | Generate PDF report for a vulnerability |
| `POST` | `/api/copilot/chat` | RAG AI copilot conversation |

### Inventory
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/inventory/scan-target` | Crawl target → discover endpoints |
| `GET` | `/api/inventory` | List all discovered endpoints |
| `GET` | `/api/inventory/export` | Export OpenAPI 3.0 JSON spec |

### Settings & Other
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/settings` | Fetch 15 persistent settings |
| `PUT` | `/api/settings` | Update and persist settings |
| `GET` | `/api/queue/status` | BullMQ worker pool metrics |
| `GET` | `/api/dashboard/stats` | Dashboard KPI data |
| `GET` | `/api/reports/:id/pdf` | Generate executive PDF report |

---

## 🚀 Local Setup

### Prerequisites
- Node.js v20+
- MongoDB (local or Atlas)
- Redis (optional — for BullMQ multi-worker mode)

### 1. Clone
```bash
git clone https://github.com/Redkrossresearch/api-security-scanner.git
cd api-security-scanner
```

### 2. Backend
```bash
cd backend
npm install
```

Create `backend/.env`:
```env
NODE_ENV=development
PORT=5000

MONGODB_URI=mongodb://localhost:27017/api-security-scanner

JWT_ACCESS_SECRET=your_secret_here
JWT_REFRESH_SECRET=your_refresh_secret

CLIENT_URL=http://localhost:5173

GEMINI_API_KEY=your_gemini_key
GROQ_API_KEY=your_groq_key
OPENROUTER_API_KEY=your_openrouter_key

# Threat Intelligence APIs
VULNERS_API_KEY=your_vulners_key
NVD_API_KEY=your_nvd_key
SHODAN_API_KEY=your_shodan_key
VIRUSTOTAL_API_KEY=your_virustotal_key
THREAT_INTEL_TIMEOUT_MS=8000
```

```bash
npm run dev
# Server: http://localhost:5000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
# App: http://localhost:5173
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite 8, React Router 7, Framer Motion, ReactFlow |
| **State** | React Context API, WebSocket (Socket.IO client) |
| **Backend** | Node.js 24, Express 5, Socket.IO |
| **Database** | MongoDB + Mongoose |
| **Task Queue** | BullMQ + Redis (in-process fallback) |
| **Auth** | Firebase Google OAuth → Backend JWT exchange |
| **AI** | Google Gemini Flash, Groq LPU, OpenRouter |
| **Threat Intel** | Vulners API, NVD NIST, Shodan, VirusTotal |
| **PDF Engine** | PDFKit, Puppeteer |
| **Deployment** | Vercel (frontend) + Render (backend) |

---

## 👥 Team

| Member | Role | Branch |
|---|---|---|
| **Atharv Gupta** | Backend Architecture, 52 Scanners, AI Engine, Threat Intel, BullMQ, Auth, Reports | `atharv-dev` |
| **Muskan** | Frontend UI/UX, React Components, Dashboard, Settings, Inventory, Copilot Chat | `muskan-dev` |

**Total Commits: 224+** across 4 branches (`main`, `dev`, `atharv-dev`, `muskan-dev`)  
See [collaboration_log.md](./collaboration_log.md) for the full sprint history.

---

## ⚖️ License

Copyright © 2024–2026 **Atharv Gupta & Muskan** — Redkross Research / ATHX Security Platform.  
All Rights Reserved. Proprietary software — unauthorized use, copying, or distribution is strictly prohibited.
