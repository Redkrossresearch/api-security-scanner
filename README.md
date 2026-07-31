# 🛡️ API Security Scanner — Enterprise AI Autonomous Security Platform (v3.2)

<div align="center">

![Platform Banner](https://img.shields.io/badge/ATHX--SECURITY-AUTONOMOUS--API--SCANNER-0F172A?style=for-the-badge&logo=shield&logoColor=38BDF8&labelColor=060910)

[![React 19](https://img.shields.io/badge/React-19.x-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Vite 8](https://img.shields.io/badge/Vite-8.x-purple?style=for-the-badge&logo=vite)](https://vite.dev/)
[![Node.js 24](https://img.shields.io/badge/Node.js-24.x-green?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![BullMQ](https://img.shields.io/badge/Task--Queue-BullMQ--Redis-orange?style=for-the-badge&logo=redis)](https://bullmq.io/)
[![Multi-Agent Orchestrator](https://img.shields.io/badge/AI--Engine-DAG--RAG--Copilot-darkviolet?style=for-the-badge&logo=openai)](https://openrouter.ai/)

**An enterprise autonomous API vulnerability assessment platform, 52-scanner DAST execution engine, multi-agent AI remediation copilot, distributed task queue telemetry monitor, full-bleed settings control center, multi-framework compliance radar, and cryptographic audit proof generator.**

</div>

---

## 📐 System Architecture Diagram

```mermaid
graph TD
    Client["💻 React 19 + Vite Dashboard UI"] -->|REST API & WebSockets| Server["⚡ Express.js Backend Server (Port 5000)"]
    
    subgraph Backend Core Engine
        Server --> Auth["🔐 Auth & RBAC Service (Firebase + JWT)"]
        Server --> ScanController["🎯 Scan Execution Controller"]
        Server --> AIController["🤖 AI Copilot (/api/ai/analyze)"]
        Server --> SettingsService["⚙️ 15 Settings MongoDB Persistence (/api/settings)"]
        Server --> ReportService["📑 Executive Report & PDF Engine"]
    end

    subgraph Async Worker Queue & 52 Scanner Suite
        ScanController --> TaskQueue["🚀 Parallel Scan Worker Queue (BullMQ)"]
        TaskQueue --> ScannerEngine["🛡️ 52 Security Scanner Modules"]
        ScannerEngine --> BOLA["BOLA / IDOR Scanner"]
        ScannerEngine --> JWT["JWT Weak Secret Probe"]
        ScannerEngine --> MassAssign["Mass Assignment Scanner"]
        ScannerEngine --> SSRF["SSRF & XXE Probe"]
        ScannerEngine --> SecurityHeaders["Security Headers & CORS"]
    end

    subgraph AI Neural Copilot & RAG Pipeline
        AIController --> DAGGraph["🧠 DAG Security Knowledge Graph"]
        AIController --> RAGEngine["📚 RAG Vector Store & Reranker"]
        AIController --> CriticEval["⚖️ AI Critic Evaluator & Self-Learner"]
        DAGGraph & RAGEngine & CriticEval --> LLMProvider["✨ OpenRouter / Gemini Flash / Groq LPU"]
    end

    subgraph Persistence & Cryptographic Audit Proof
        ScannerEngine --> DB[("🍃 MongoDB Database")]
        ReportService --> CertGen["📜 Cryptographic Certificate Engine (SHA256 & Signature)"]
        CertGen --> OutputDoc["📄 Printable Diploma & PDF/CSV/JSON Package"]
    end
```

---

## ⚡ Key Platform Capabilities

### 1. 🚀 100% Full-Width Task Queue & Worker Telemetry Monitor (`/queue`)
- Real-time **WebSocket Terminal Event Stream Log** capturing `scan:start`, `scan:progress`, `scan:completed`, and `scan:failed` live logs.
- **8-Slot Worker Thread Pool Capacity Visualizer Grid** showing active slot allocation and CPU state.
- **1-Click Re-queueing Action** with instant progress state animation and CSV audit export.

### 2. 🎛️ Full-Bleed Settings Control Center (`/settings`)
- **15 Persistent Settings Fields** backed by MongoDB (`GET /api/settings`, `PUT /api/settings`).
- **Interactive Visual Theme Cards** (`Dark Midnight`, `Cyberpunk Neon`, `Deep Obsidian`, `Sleek Slate`) mutating CSS root variables site-wide in real-time via `athx-settings-updated` global event bus.
- **30 Hacker Operator Avatars Gallery**, Web Audio Synthesizer, dynamic Security Posture Score meter (0-100%), and 1-click JSON backup export/import.

### 3. 🎯 Direct Target Discovery Scanner & API Inventory (`/inventory`)
- Direct website ingestion bar extracting API endpoints from JS ASTs.
- High-contrast URL input box, host grouping, risk badges, and 1-click **OpenAPI 3.0 Specification Export**.

### 4. 📊 Glassmorphic Security Overview Dashboard (`/dashboard`)
- Circular glowing **Security Grade Score Ring Meter** with score denominator (`51 / 100`).
- Ambient purple **AI Security Copilot Banner** with live pulse badge.
- **180px High-Definition Scan Activity Trend Chart** with glowing dual area gradients.

---

## 📂 Project Directory Structure

```
api-security-scanner/
├── backend/
│   ├── src/
│   │   ├── config/              # Database, environment & feature flag settings
│   │   ├── modules/
│   │   │   ├── ai/              # AI Remediation engine & multi-LLM adapters
│   │   │   ├── agents/          # Autonomous Agent Roster (Planner, Fixer, Judge)
│   │   │   ├── copilot/         # Chat controllers & learned insight model
│   │   │   ├── inventory/       # Target endpoint discovery scanner & OpenAPI exporter
│   │   │   ├── knowledge/       # Tag taxonomy & knowledge graph services
│   │   │   ├── llm/             # RAG Vector store, Reranker, DAG Knowledge Graph
│   │   │   ├── queue/           # BullMQ status metrics & worker diagnostics routes
│   │   │   ├── reports/         # PDF Report Builder & Cryptographic Cert Engine
│   │   │   ├── scanner/         # 52 Security Scanner Modules (BOLA, JWT, SSRF, XXE...)
│   │   │   ├── scans/           # Scan orchestrator, attack graph & stage telemetry
│   │   │   ├── settings/        # 15 Settings schema & MongoDB persistence controller
│   │   │   └── vulnerabilities/ # Vulnerability catalog (CVSS 3.1 & remediation)
│   │   └── utils/               # Storage cleanup, mailer, load tests
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ai/              # Attack diagram cards & AI remediation panels
│   │   │   ├── copilot/         # Chart, Image Lightbox, Copy & Citation renderers
│   │   │   ├── dashboard/       # Dashboard KPIs, trend charts & threat feeds
│   │   │   ├── layouts/         # Sidebar, Navbar & Particle background
│   │   │   └── scans/           # Live scanner logs, ScanConfigurationCard, Findings
│   │   ├── contexts/            # AuthContext (Firebase + JWT)
│   │   ├── layouts/             # MainLayout (100vh viewport scroll container)
│   │   ├── pages/               # Scans, History, Copilot, Reports, Queue, Settings, Inventory
│   │   ├── services/            # Axios API client with production Vercel auto-fallback
│   │   └── sockets/             # Socket.IO client & ConnectionStatus badge
│   └── index.css                # Global Design Tokens, Micro-Interactions & Mobile Grids
├── collaboration_log.md         # Official Sprint & Teamwork Contribution Log
├── README.md                    # Enterprise Documentation & Setup Guide
└── vercel.json                  # Production Build & Rewrite Configuration
```

---

## 🛠️ Quickstart & Local Setup

### 1. Prerequisites
- **Node.js**: v20.x or higher
- **MongoDB**: Local URI or MongoDB Atlas Cluster
- **Redis (Optional)**: For BullMQ multi-worker queue mode

### 2. Backend Setup
```bash
cd backend
npm install
# Configure backend/.env
# PORT=5000, MONGO_URI=mongodb://localhost:27017/api-security-scanner
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## ⚖️ Intellectual Property & Licensing
Copyright (c) 2024-2026 **Atharv Gupta** and **Muskan** (Redkross Research / ATHX Security Platform). All Rights Reserved.
