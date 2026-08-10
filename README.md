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

> **ATHX Security is an autonomous, AI-powered API security platform that scans any web application for vulnerabilities, enriches findings with live threat intelligence, and delivers AI-generated fixes — all in real time.**

Most security tools tell you *what* is broken. ATHX tells you **what it is, how severe it is, where it came from, and exactly how to fix it** — with code patches, compliance mappings, and cryptographic audit reports ready to share.

Built for developers, security engineers, and DevSecOps teams who need deep API security without a six-figure enterprise contract.

---

## 🏗️ System Architecture

```mermaid
graph TB
    User(["👤 User / Security Engineer"])

    subgraph Frontend ["🖥️ Frontend — Vercel (React 19 + Vite 8)"]
        direction LR
        Dashboard["📊 Dashboard"]
        Scans["🔍 Scans"]
        Copilot["🤖 AI Copilot"]
        Reports["📜 Reports"]
        Queue["⚡ Queue Monitor"]
        Inventory["🗂️ Inventory"]
        Settings["⚙️ Settings"]
    end

    subgraph Backend ["⚙️ Backend — Render (Node.js 24 + Express 5)"]
        direction TB
        Auth["🔐 Auth & JWT Middleware"]
        ScanOrch["🎯 Scan Orchestrator"]
        ThreatIntel["🌐 Threat Intelligence Layer"]
        AIEngine["🧠 AI Engine"]
        ReportEngine["📑 Report & PDF Engine"]
        SettingsAPI["⚙️ Settings API"]
        QueueAPI["⚡ BullMQ Queue"]
    end

    subgraph DataLayer ["🗄️ Persistence Layer"]
        MongoDB[("🍃 MongoDB Atlas")]
        Redis[("🔴 Redis Cache")]
    end

    subgraph ExternalAPIs ["🌍 External Intelligence APIs"]
        Vulners["🔴 Vulners CVE DB"]
        NVD["🔵 NVD NIST"]
        Shodan["🟠 Shodan"]
        VirusTotal["🟢 VirusTotal"]
        LLMs["✨ Gemini / Groq / OpenRouter"]
    end

    User --> Frontend
    Frontend <-->|"REST + WebSocket"| Backend
    Backend --> DataLayer
    ThreatIntel --> ExternalAPIs
    AIEngine --> LLMs
    QueueAPI <--> Redis
    Backend --> MongoDB
```

---

## 🔄 Scan Execution Pipeline

```mermaid
flowchart TD
    A(["🌐 Target URL Input"]) --> B["Web Crawler & JS AST Parser"]
    B --> C["⚡ Tech Stack Fingerprinting\nNginx · Apache · PHP · Node.js · React"]

    C --> D{{"🚀 Parallel Execution Engine\nPromise.all"}}

    D --> E["🛡️ 52 DAST Scanners"]
    D --> F["🌐 Live Threat Intel Sources"]

    subgraph Scanners ["52 Security Probe Modules"]
        E --> E1["💉 Injection\nSQL · NoSQL · CMD · LDAP"]
        E --> E2["🔑 Auth & Access\nBOLA · BFLA · JWT · OAuth"]
        E --> E3["🌐 Network\nSSRF · XXE · CORS · HSTS"]
        E --> E4["📂 Exposure\nGit · Env · Swagger · Files"]
        E --> E5["⚡ Advanced\nPath Traversal · Smuggling · SSTI"]
    end

    subgraph ThreatIntel ["Live Threat Intelligence"]
        F --> F1["🔴 Vulners\nCVEs by Tech Stack"]
        F --> F2["🟠 Shodan\nOpen Ports & Services"]
        F --> F3["🟢 VirusTotal\nMalware & Reputation"]
        F --> F4["🔵 NVD\nCVSS v3.1 Scores"]
    end

    E1 & E2 & E3 & E4 & E5 --> G["📋 Raw Findings Collector"]
    F1 & F2 & F3 & F4 --> G

    G --> H["🔗 Merge & Deduplicate\nby CVE ID"]
    H --> I["📊 NVD CVSS Enrichment\nAuthoritative Score Override"]
    I --> J["🧠 AI Analysis & Code Fix Generator"]
    J --> K["📜 PDF Report + SHA256 Audit Diploma"]
    K --> L(["✅ Findings Delivered to Dashboard"])
```

---

## 🌐 Threat Intelligence Strategy

```mermaid
flowchart LR
    Scan(["🎯 Scan Started"]) --> Parallel{{"⚡ Parallel Query\nPromise.allSettled"}}

    Parallel --> V["🔴 Vulners API\nCVEs for PHP · Apache · Nginx"]
    Parallel --> S["🟠 Shodan API\nOpen Ports · Banners · CVEs"]
    Parallel --> VT["🟢 VirusTotal API\nDomain · URL · IP Reputation"]

    V --> Check1{Responded?}
    S --> Check2{Responded?}
    VT --> Check3{Responded?}

    Check1 -->|✅ Yes| Merge
    Check1 -->|❌ Timeout| Fallback
    Check2 -->|✅ Yes| Merge
    Check2 -->|❌ Timeout| Fallback
    Check3 -->|✅ Yes| Merge
    Check3 -->|❌ Timeout| Fallback

    Fallback["📁 Internal Catalog\n8,137+ Entries\n⚡ Zero Latency"] --> Merge

    Merge(["🔗 Merge + Dedup"]) --> NVD["🔵 NVD NIST API\nAuthoritative CVSS v3.1\nBackground Enrichment"]

    NVD --> Output(["📊 Enriched Findings\nUnified Result Set"])

    style Fallback fill:#1E293B,stroke:#F97316,color:#F97316
    style NVD fill:#1E293B,stroke:#38BDF8,color:#38BDF8
    style Merge fill:#1E293B,stroke:#10B981,color:#10B981
```

---

## 🧠 AI Copilot Pipeline

```mermaid
flowchart TD
    Q(["💬 User Security Query"]) --> Router["🔀 Query Router & Intent Classifier"]

    Router --> RAG["📚 RAG Vector Store\nPast Scans + Vuln Catalog"]
    Router --> DAG["🕸️ DAG Knowledge Graph\nOWASP / CWE Taxonomy"]
    Router --> Web["🔍 Live Web Search\nLatest CVEs & Zero-Days"]

    RAG --> Context["🧩 Context Assembly\nGrounded Response Builder"]
    DAG --> Context
    Web --> Context

    Context --> LLM{{"✨ LLM Selection\nAuto-Routing by Latency"}}

    LLM --> G["🟣 Google Gemini Flash"]
    LLM --> GR["🟡 Groq LPU\nUltra-Fast Inference"]
    LLM --> OR["🔵 OpenRouter\nModel Fallback"]

    G & GR & OR --> Critic["⚖️ AI Critic Evaluator\nSelf-Quality Check"]

    Critic -->|Score < threshold| Context
    Critic -->|Score ✅ pass| Output

    Output(["📤 Final Response"]) --> P1["🔧 Code Patch\nbefore → after diff"]
    Output --> P2["📎 Citation Cards\nNIST · OWASP · CVE"]
    Output --> P3["🖼️ Attack Diagram"]

    style Critic fill:#1E293B,stroke:#F97316,color:#F97316
    style Output fill:#1E293B,stroke:#10B981,color:#10B981
```

---

## 🛡️ 52-Scanner DAST Engine

```mermaid
mindmap
  root(("🛡️ 52 DAST\nScanners"))
    Injection
      SQL Injection
      NoSQL Injection
      Command Injection
      LDAP Injection
      XPath Injection
      SSTI
    Auth & Access
      BOLA / IDOR
      BFLA
      JWT Weak Secret
      JWT Algorithm
      OAuth Misconfiguration
      Mass Assignment
    Network & Protocol
      SSRF
      XXE
      CORS
      HSTS Config
      HTTP Smuggling
      SSL / TLS
    Data Exposure
      Server Header Disclosure
      Env File Exposure
      Git Exposure
      Swagger Exposure
      Exposed Files
      Redis Exposure
      Cloud Metadata
    Advanced Attacks
      Path Traversal
      Prototype Pollution
      Open Redirect
      Cookie Security
      CSRF
      Clickjacking
    API Specific
      GraphQL Introspection
      gRPC Security
      WebSockets
      Rate Limiting
      API Versioning
      Subdomain Takeover
```

---

## 📊 Compliance Framework Coverage

```mermaid
pie title Security Framework Coverage
    "OWASP API Top 10" : 40
    "CWE Weakness Catalog" : 25
    "PCI-DSS v4.0" : 15
    "SOC 2 Type II" : 12
    "ISO 27001" : 8
```

---

## 🗂️ Project Structure

```mermaid
graph LR
    Root["📁 api-security-scanner"] --> BE["📁 backend"]
    Root --> FE["📁 frontend"]
    Root --> Docs["📁 docs"]
    Root --> Collab["📄 collaboration_log.md"]
    Root --> Readme["📄 README.md"]

    BE --> Modules["📁 modules"]
    Modules --> M1["🔐 auth"]
    Modules --> M2["🛡️ scanner\n52 probe modules"]
    Modules --> M3["🌐 threat-intel\nVulners·NVD·Shodan·VT"]
    Modules --> M4["🧠 ai + llm\nRAG · DAG · Copilot"]
    Modules --> M5["📑 reports\nPDF · Crypto Certs"]
    Modules --> M6["⚡ queue\nBullMQ · Workers"]
    Modules --> M7["🗂️ inventory\nAST Crawler · OpenAPI"]
    Modules --> M8["📊 vulnerabilities\n8137+ entry catalog"]
    Modules --> M9["⚙️ settings\n15 persisted fields"]
    Modules --> M10["🔢 engines\nCVSS · Risk · Severity"]

    FE --> Src["📁 src"]
    Src --> C["📁 components"]
    C --> C1["📊 dashboard"]
    C --> C2["🔍 scans\nAttackSurfaceMap"]
    C --> C3["🤖 copilot"]
    C --> C4["📁 layouts\nSidebar · Navbar"]
    Src --> Pages["📁 pages"]
    Src --> Services["📁 services\nAxios · 120s timeout"]
    Src --> Sockets["📁 sockets\nSocket.IO client"]
```

---

## 🚀 Scan Lifecycle & WebSocket Events

```mermaid
sequenceDiagram
    participant U as 👤 User
    participant FE as 🖥️ Frontend
    participant BE as ⚙️ Backend
    participant Q as ⚡ BullMQ
    participant S as 🛡️ Scanner Engine
    participant TI as 🌐 Threat Intel
    participant AI as 🧠 AI Engine

    U->>FE: Submit Target URL
    FE->>BE: POST /api/scans/start
    BE->>Q: Enqueue Scan Job
    BE-->>FE: 200 OK { scanId }

    Q->>S: Dequeue & Execute
    S-->>FE: WS scan:start
    S->>S: Run 52 Scanners in parallel
    S-->>FE: WS scan:progress (stages)

    S->>TI: Query Vulners + Shodan + VirusTotal
    TI-->>S: CVEs + Port Data + Reputation

    S->>AI: Enrich findings with NVD CVSS
    AI-->>S: CVSS v3.1 scores

    S->>AI: Generate code patches
    AI-->>S: Fix recommendations

    S-->>FE: WS scan:completed
    FE->>BE: GET /api/scans/:id
    BE-->>FE: Full findings + CVSS + AI patches
    FE-->>U: Dashboard updated ✅
```

---

## 📡 Complete API Reference

### 🔐 Auth
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/google-login` | Google OAuth → JWT token exchange |
| `POST` | `/api/auth/register` | Email/password registration |
| `POST` | `/api/auth/login` | Email/password login |
| `POST` | `/api/auth/logout` | Invalidate session |

### 🔍 Scans
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/scans/start` | Launch 52-scanner parallel DAST audit |
| `GET` | `/api/scans` | List all scans with status |
| `GET` | `/api/scans/:id` | Full scan detail (findings, CVSS, telemetry) |
| `POST` | `/api/scans/:id/reaudit` | Re-queue existing scan |
| `DELETE` | `/api/scans/:id` | Delete scan record |

### 🌐 Threat Intelligence _(New)_
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/threat-intel/scan` | Full scan — all sources + catalog + NVD enrichment |
| `GET` | `/api/threat-intel/cve/:cveId` | NVD official CVE details + CVSS v3.1 |
| `GET` | `/api/threat-intel/shodan/:host` | Shodan open ports + host CVEs |
| `GET` | `/api/threat-intel/virustotal/:target` | VirusTotal domain/URL/IP reputation |
| `GET` | `/api/threat-intel/vulners/:software` | Vulners CVE search by software name |

### 🧠 AI & Copilot
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/ai/analyze` | AI vulnerability analysis + code fix |
| `POST` | `/api/ai/export-pdf` | Generate PDF for a vulnerability |
| `POST` | `/api/copilot/chat` | RAG AI copilot conversation |

### 🗂️ Inventory
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/inventory/scan-target` | Crawl target → discover endpoints via JS AST |
| `GET` | `/api/inventory` | List all discovered endpoints |
| `GET` | `/api/inventory/export` | Export OpenAPI 3.0 JSON spec |

### ⚙️ Settings & Other
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/settings` | Fetch 15 persistent settings |
| `PUT` | `/api/settings` | Update and persist settings |
| `GET` | `/api/queue/status` | BullMQ worker pool metrics |
| `GET` | `/api/dashboard/stats` | Dashboard KPI data |
| `GET` | `/api/reports/:id/pdf` | Generate executive PDF report |

---

## ✨ Feature Summary

| Feature | Details |
|---|---|
| **52-Scanner DAST Engine** | Parallel `Promise.all` execution, CVSS 3.1, CWE/OWASP mapped |
| **Live Threat Intel** | Vulners + Shodan + VirusTotal + NVD, catalog fallback (zero latency) |
| **AI Security Copilot** | RAG + DAG + Web Search, Gemini / Groq / OpenRouter, code patches |
| **Real-Time WebSockets** | Live scan progress, worker pool events via Socket.IO |
| **BullMQ Worker Queue** | 8-thread pool, re-queue, CSV export, live terminal stream |
| **API Inventory Discovery** | JS AST crawling, host grouping, OpenAPI 3.0 export |
| **6-Format Report Export** | PDF · DOCX · CSV · JSON · YAML · ZIP |
| **Cryptographic Diplomas** | SHA256 seal + HMAC signature on audit certificates |
| **Compliance Radar** | OWASP API Top 10 · PCI-DSS v4.0 · SOC 2 Type II · ISO 27001 |
| **Settings Engine** | 15 MongoDB settings, 4 themes, site-wide CSS bus, Web Audio synth |
| **Attack Surface Map** | ReactFlow interactive vulnerability graph |
| **Multi-Framework Auth** | Firebase Google OAuth + JWT + RBAC roles |

---

## 🛠️ Local Setup

### Prerequisites
- Node.js v20+
- MongoDB (local or Atlas)
- Redis *(optional — for BullMQ multi-worker mode)*

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

JWT_ACCESS_SECRET=your_secret
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
# → http://localhost:5000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

---

## 🛠️ Tech Stack

```mermaid
graph LR
    subgraph Frontend
        R["⚛️ React 19"]
        V["⚡ Vite 8"]
        FM["🎞️ Framer Motion"]
        RF["🕸️ ReactFlow"]
        SIO_C["🔌 Socket.IO Client"]
    end

    subgraph Backend
        N["🟢 Node.js 24"]
        E["🚂 Express 5"]
        SIO_S["🔌 Socket.IO Server"]
        BQ["⚡ BullMQ"]
        MG["🍃 Mongoose"]
    end

    subgraph AI_Layer ["AI Layer"]
        GEM["🟣 Gemini Flash"]
        GROQ["🟡 Groq LPU"]
        OR["🔵 OpenRouter"]
    end

    subgraph ThreatIntel_Layer ["Threat Intel"]
        VU["🔴 Vulners"]
        NVD2["🔵 NVD NIST"]
        SH["🟠 Shodan"]
        VT2["🟢 VirusTotal"]
    end

    subgraph Data
        MDB[("🍃 MongoDB Atlas")]
        RD[("🔴 Redis")]
    end

    Frontend <--> Backend
    Backend --> AI_Layer
    Backend --> ThreatIntel_Layer
    Backend --> Data
    BQ <--> RD
```

---

## 👥 Team

| Member | Role | Branch |
|---|---|---|
| **Atharv Gupta** | Backend Architecture · 52 Scanners · AI Engine · Threat Intel · BullMQ · Auth · Reports · DevOps | `atharv-dev` |
| **Muskan** | Frontend UI/UX · React Components · Dashboard · Settings · Inventory · Copilot Chat · Design System | `muskan-dev` |

**Total Commits: 224+** across `main` · `dev` · `atharv-dev` · `muskan-dev`

See [collaboration_log.md](./collaboration_log.md) for the complete sprint history and contribution breakdown.

---

## ⚖️ License

Copyright © 2024–2026 **Atharv Gupta & Muskan** — Redkross Research / ATHX Security Platform.
All Rights Reserved. Proprietary software — unauthorized use, copying, or distribution is strictly prohibited.
