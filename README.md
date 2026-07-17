# 🛡️ ATHX Security (Enterprise API Security Platform)

<div align="center">

![Platform Banner](https://img.shields.io/badge/ATHX--SECURITY-ENTERPRISE--API--SHIELD-0F172A?style=for-the-badge&logo=shield&logoColor=38BDF8&labelColor=060910)

[![React 19](https://img.shields.io/badge/React-19.x-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Vite 8](https://img.shields.io/badge/Vite-8.x-purple?style=for-the-badge&logo=vite)](https://vite.dev/)
[![Node.js 24](https://img.shields.io/badge/Node.js-24.x-green?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![BullMQ](https://img.shields.io/badge/Task--Queue-BullMQ--Redis-orange?style=for-the-badge&logo=redis)](https://bullmq.io/)
[![AI-Copilot](https://img.shields.io/badge/AI--Copilot-OpenRouter-darkviolet?style=for-the-badge&logo=openai)](https://openrouter.ai/)

**An elite, high-performance API vulnerability assessment platform, multi-agent debate orchestrator, and DevSecOps automated scanner.**
</div>

---

## ⚡ Core Platform Status

ATHX Security integrates active crawling, automated pentesting, multi-agent AI debate loops, and long-term memory structures to deliver production-grade API assessment pipelines.

### Hybrid Execution Matrix

| Capability Module | Local / Production Mode (Redis & Credentials) | Stateless Fallback Mode (Serverless Vercel Deploy) | Status |
| :--- | :--- | :--- | :---: |
| **🤖 Core Scanners & Crawler** | Crawls forms, anchors, parameters via Axios and runs 23 active security audits (SQLi, XSS, Path Traversal, SSL, CORS, Cookies, exposed files). | Runs in-process fallback scans with dynamic time-based database progress updates. | **Production-Ready** ✅ |
| **⏳ Distributed Task Queue** | Offloads heavy scans to a BullMQ task queue with multi-worker concurrency. | Falls back to in-process execution with asynchronous promise loops. | **Production-Ready** ✅ |
| **🔄 Live Scanner Logs** | Broadcasts live scanner logs and discoveries via Socket.IO channels. | Gracefully falls back to polling `/api/scans/:id/status` with simulated log triggers. | **Production-Ready** ✅ |
| **🧠 RAG Vector DB** | Indexes advisories, OpenAPI structures, and CWE vectors using cosine-similarity RAG. | Utilizes fast local database indexing with semantic embedding weights fallbacks. | **Production-Ready** ✅ |
| **👥 Pentester debate loops** | Chains 6 specialized agents (Pentester, CVE, Code review, Reviewer, Compliance, Judge) for cross-check consensus. | Resolves prompt judgments with resilient fallback adapter chains. | **Production-Ready** ✅ |
| **🔒 PDF Report Exporter** | Compiles executive security status, grades, WAF rules, and remediation actions into a polished PDF. | Generates PDF streams dynamically via report generator services. | **Production-Ready** ✅ |
| **🔌 GitHub OAuth Integration** | Triggers centered popup OAuth, lists repos/branches, and commits workflow files. | Loads local OAuth authorization mock panel and simulated workflow sync. | **Production-Ready** ✅ |

---

## 📐 System Architecture

### Platform Topology
```mermaid
graph TD
    User([Security User / CI/CD Gate]) -->|HTTPS API Requests| Gateway[Express App / API Gateway]
    
    subgraph Backend Services
        Gateway --> Auth[Auth Service / JWT]
        Gateway --> Scans[Scan Service / Orchestrator]
        Gateway --> AI[OpenRouter / Multi-LLM Registry]
        Gateway --> Reports[PDF Exporter & OpenAPI Exporter]
        Gateway --> RAG[RAG Ingestion / Vector Store]
        
        Scans -->|Check Redis availability| QueueClient{Queue Selector}
        QueueClient -->|Redis Live| BullMQ[BullMQ Job Queue]
        QueueClient -->|Redis Offline| InProc[In-Process Fallback Engine]
        
        BullMQ -->|De-queues scan jobs| Worker[Background Worker Threads]
        InProc --> Scanners[23 Active Scanner Engines]
        Worker --> Scanners
    end
    
    subgraph Database Layer
        Scanners -->|Save Scan Details| Mongo[(MongoDB / Mongoose)]
        RAG -->|Store Semantic Chunks| Mongo
    end
    
    subgraph Frontend Control Room
        UI([React 19 Dashboard]) -->|HTTP Polling / Socket.IO| Gateway
        UI -->|Displays metrics| Monitor[Queue Monitor Dashboard]
        UI -->|Interactive workflow canvas| Workflow[Workflow Builder]
    end
```

---

## 🧠 Advanced Subsystems

### 1. Intelligent LLM Router & Guardrails
Incoming prompts are dynamically classified and routed through a resilient fallback chain. Outgoing data passes through sanitizers to protect sensitive credentials.

```mermaid
graph LR
    Prompt[User Input] --> Guard[Guardrails Validation]
    Guard --> Classifier{Intelligent Router}
    Classifier -->|Coding Category| OpenAI[OpenAI Adapter]
    Classifier -->|Reasoning Category| Claude[Claude Adapter]
    Classifier -->|General Category| OpenRouter[OpenRouter Shorthand]
    
    OpenAI -->|Fail / Timeout| Fallback[Ollama / Local Mock Fallback]
    Fallback --> Redact[Database Secret Redaction]
    Redact --> Output[Sanitized AI Response]
```

### 2. Multi-Agent Pentester Debate Pipeline
Specialized agents challenge and critique each other to reach a final, high-confidence consensus regarding vulnerability severity and remediation plans.

```mermaid
sequenceDiagram
    participant O as Agent Orchestrator
    participant P as Pentester Agent
    participant C as CVE Analyst Agent
    participant R as Reviewer Agent
    participant J as Judge Agent

    O->>P: Analyze vulnerability payload response
    P->>O: Propose exploit path (Critical)
    O->>C: Correlate CVSS severity score
    C->>O: Map CVSS 9.8 vector details
    O->>R: Audit findings & challenge claims
    R->>O: Propose alternative risk levels (Medium)
    O->>J: Compile debate traces & finalize report
    J->>O: Final markdown consensus verdict (High)
```

---

## 🛠️ Installation & Setup

### Prerequisites
* **Node.js** v24+
* **MongoDB** (Local or Atlas Connection URI)
* **Redis** (Optional: required for BullMQ queues)

### Local Development Setup

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/Atharv-design/api-security-scanner.git
   cd api-security-scanner
   ```

2. **Configure Backend Environment:**
   Create a `.env` file in the `backend/` directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_ACCESS_SECRET=your_jwt_access_secret
   JWT_REFRESH_SECRET=your_jwt_refresh_secret
   CLIENT_URL=http://localhost:5173
   OPENROUTER_API_KEY=your_openrouter_api_key
   
   # --- BACKGROUND TASK QUEUE (REDIS) ---
   # Enable BullMQ background worker queue. If commented out, falls back to in-process.
   # REDIS_URL=redis://127.0.0.1:6379
   # QUEUE_CONCURRENCY=3
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

## 📈 Quality Benchmarking & Chaos Testing

### 1. Golden Dataset Quality Benchmarks
To run the automated precision benchmark test suite against 50 pre-defined security scenarios:
```bash
cd backend
node src/modules/llm/consensus/runBenchmark.js
```
*Outputs accuracy coefficients, MTTR profiles, and consensus correlation percentages.*

### 2. Chaos Resilience Testing
Simulate random adapter crashes and connection drops to test the circuit-breaker fallback mechanisms:
```bash
cd backend
node src/modules/llm/consensus/runChaosTest.js
```

---

## 🔮 Future Development Roadmap

- [ ] **Sandboxed Scanner Containers:** Execute command injections and exploits within transient, isolated Docker sandboxes.
- [ ] **Auto-Patch Git Integration:** Enable autonomous agents to create feature branches and submit PRs with validated code fixes automatically.
- [ ] **Live NVD CVE Sync Cron:** Repeatable BullMQ cron job updating local RAG threat indexes from the National Vulnerability Database API every 24 hours.
- [ ] **WAF Deploy Webhooks:** Automated cloud webhooks updating Cloudflare/AWS WAF rule profiles directly upon vuln validation.
