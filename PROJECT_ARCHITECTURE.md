# API Security Scanner Platform — Architecture & System Design Report

This document provides a highly detailed, professional analysis of the entire **API Security Scanner** platform, detailing its folder structure, frontend design, backend infrastructure, API design, authentication mechanism, database models, background queues, and cutting-edge artificial intelligence modules.

---

## 1. Project High-Level Overview

The **API Security Scanner** is an enterprise-grade web application and automation platform designed to discover, fuzz, catalog, and mitigate vulnerabilities across web applications, REST API endpoints, and microservices. It features:
- An **Active Scanner Suite** containing 18 distinct scanning modules (fuzzers, Crawlers, and checkers).
- A **Real-Time Synchronized State Engine** utilizing Socket.IO for live logs, scan progress, vulnerability disclosures, and system metrics.
- A **Dual Pipeline Executor** (BullMQ/Redis background worker queue with a graceful in-process fallback system).
- An **AI-Powered Vulnerability Analysis Engine** powered by OpenRouter (with a robust local rule-based fallback).
- A **Semantic Security Copilot (ATHX AI)** featuring RAG, automatic memory learning, multi-model selection (keyless, free Pollinations integration), web-search scraping, and 100+ multi-format attachment parsers.

---

## 2. Directory & Folder Structure

The project is organized as a monorepo splitting the workspace cleanly into `frontend` (React + Vite SPA) and `backend` (Express API Server + Sockets Server).

```text
api-security-scanner/
│
├── PROJECT_ARCHITECTURE.md          # This System Architecture Document
├── README.md                       # Main Setup and Getting Started Guide
├── Socket_IO_Architecture_Prompt.docx # WebSocket specifications
├── socket_io_realtime_upgrade_plan.md # Real-time architectural roadmap
│
├── backend/                        # API Server, Socket Server, and Background Worker
│   ├── server.js                   # Node.js Bootstrap and Entry Point
│   ├── package.json                # Server Dependencies and Commands
│   ├── .env.example                # Template for Environment Configuration
│   ├── .gitignore                  # Git Ignore Rules
│   ├── diagnose_500.js             # Utility script for server debugging
│   │
│   └── src/                        # Main Backend Source Code
│       ├── app.js                  # Express Application & Middleware Routing
│       │
│       ├── config/                 # Configuration Layer
│       │   ├── db.js               # Mongoose MongoDB Connection Handler
│       │   └── env.js              # Enforced Environment Variable Schema
│       │
│       ├── middleware/             # Request Interceptors
│       │   ├── auth.middleware.js  # JWT Verification Interceptor
│       │   ├── authorize.middleware.js # RBAC Route Guard
│       │   ├── rateLimiter.js      # API Rate Limit (Auth vs General endpoints)
│       │   ├── team.middleware.js  # Multi-tenant Team Scoping Checks
│       │   └── validate.middleware.js # Request Schema Validators (Joi/Zod)
│       │
│       ├── queue/                  # Background Job Queues
│       │   ├── redis.client.js     # Redis Client Connection & Availability Checks
│       │   ├── scan.queue.js       # BullMQ Job Enqueuer
│       │   └── scan.worker.js      # BullMQ background Job Processor
│       │
│       ├── prompt/                 # AI prompt engineering
│       │   ├── genericSystemPrompt.js
│       │   └── outputSchema.json   # JSON schema for OpenAI schema structures
│       │
│       ├── prompts/                # Dedicated security AI instruction sets
│       │   └── security-analysis.prompt.js
│       │
│       ├── sockets/                # Socket.IO Event Engine
│       │   ├── index.js            # Module entry point
│       │   ├── socket.server.js    # Socket.IO Server bootstrap (CORS, Ping/Pong)
│       │   ├── socket.auth.middleware.js # Socket handshake JWT validator
│       │   ├── socket.connection.manager.js # Live user connection map
│       │   ├── socket.event.registry.js   # Client-Server Socket Event Handlers
│       │   ├── socket.health.js    # Periodic health tracking / Ping-pong loop
│       │   ├── socket.cleanup.js   # Disconnect garbage collector
│       │   ├── socket.constants.js # Shared event constants
│       │   ├── socket.error.handler.js # Socket exception interceptor
│       │   ├── socket.logger.js    # Sockets diagnostic logger
│       │   └── emitters/           # Outbound Real-Time Event Dispatchers
│       │
│       ├── utils/                  # Shared Utility Libraries
│       │   ├── cvss.util.js        # CVSS v3 Severity Matrix Calculators
│       │   ├── dashboardCache.js   # Redis/In-Memory Cache wrapper for charts
│       │   ├── logger.js           # Winston/Pino Console & File Logger
│       │   └── openapi-analyzer.js # Utility for parsing OpenAPI spec objects
│       │
│       └── modules/                # Core Business Logic Layer (Clean Architecture)
│           ├── ai/                 # OpenRouter API & Vulnerability Report Engine
│           ├── auth/               # User Authentication & Profiles (JWT, Mongoose)
│           ├── copilot/            # ATHX Copilot, Memories, RAG & Few-Shot Pairs
│           ├── dashboard/          # Analytics aggregator and KPI service
│           ├── engines/            # CVSS, Risk, and Security Score Engines
│           ├── history/            # Scan history tracking & Forecast analysis
│           ├── queue/              # Queue Monitoring controller
│           ├── reports/            # PDF and HTML Report Generators
│           ├── scanner/            # Web Crawler & 17 Active Scanning Modules
│           ├── scans/              # Scan execution controllers & state persistence
│           ├── scheduler/          # Cron / Scheduler service for recurrent scans
│           ├── settings/           # Notification dispatchers (Slack, Discord, Jira)
│           ├── teams/              # Multi-tenant Team Collaboration
│           └── vulnerabilities/    # Global Vulnerability Catalog & DB collections
│
├── frontend/                       # React + Vite Client Application (SPA)
│   ├── index.html                  # Single Page Application Entry
│   ├── package.json                # UI Dependencies & Tool configurations
│   ├── eslint.config.js            # Linting definitions
│   ├── vercel.json                 # Routing rules for Vercel deployment
│   ├── vite.config.js              # Vite compiler configuration
│   │
│   └── src/                        # UI Source Code
│       ├── main.jsx                # DOM mounter, StrictMode and root wrappers
│       ├── App.jsx                 # Routing table & Toast providers
│       ├── firebase.js             # Firebase Auth initialization client
│       ├── index.css               # Base styles & fonts imports
│       ├── globals.css             # Tailwind UI extensions
│       │
│       ├── assets/                 # Client Static Images & Vector Art
│       ├── constants/              # Frontend configuration variables
│       ├── contexts/               # React State Providers
│       │   └── AuthContext.jsx     # Firebase Auth sync & Google Sign-In wrapper
│       │
│       ├── hooks/                  # Custom React Hooks (State Management)
│       ├── layouts/                # Structural Grid Templates
│       │   ├── MainLayout.jsx      # Navigation, Sidebar & Content framework
│       │   ├── AuthLayout.jsx      # Guarded Auth UI layout
│       │   └── AdminLayout.jsx     # Admin Console settings layout
│       │
│       ├── pages/                  # Routable view components
│       ├── routes/                 # Navigation gates
│       │   └── ProtectedRoute.jsx  # Token validation Route Guard
│       │
│       ├── services/               # Axios API Gateways to Backend
│       ├── sockets/                # Socket.IO Client hooks, contexts and wrapper
│       │   ├── socketClient.js     # Raw Socket connection configuration
│       │   ├── SocketContext.js    # React Socket Context
│       │   ├── SocketProvider.jsx  # Handshake lifecycle and Network Latency calculator
│       │   ├── ConnectionStatus.jsx # Real-time Status banner (Connected, Ping)
│       │   └── useScanRoom.js      # Multi-room workspace join hooks
│       │
│       ├── styles/                 # Custom CSS overrides and themes
│       ├── theme/                  # Atomic Design system Tokens (colors, typography)
│       ├── utils/                  # Client formatting and export helpers
│       │
│       └── components/             # Reusable UI Atoms & Organisms
│           ├── VulnerabilityModal.jsx # Detailed Vulnerability analyzer
│           ├── ai/                 # Cards for AI Technical reports & scenario steps
│           ├── auth/               # Google Login buttons & register modals
│           ├── common/             # Markdown Renderer, spinners, loaders
│           ├── copilot/            # Chat layouts, bubbles, panels and prompt boxes
│           └── dashboard/          # Analytics widgets, KPIs, charts & threat feeds
│
└── scratch/                        # Script Testing & Utilities
    ├── generate_catalog.js         # Bootstrap script for Vulnerability Catalog
    └── read_docx.py                # Python document parsing utility
```

---

## 3. Frontend Architecture (Client SPA)

The frontend is built as a state-of-the-art Single Page Application (SPA) focusing on high-tech aesthetics, micro-interactions, and real-time responsiveness.

### Tech Stack Components:
- **Framework & Compiler**: React 19 (JS module) compiled with **Vite 8**.
- **Styles & Themes**: **Tailwind CSS v4** utilizing atomic design tokens (`src/theme/`) for colors, glassy panels, spacing, animations, and border-radius.
- **Routing**: **React Router DOM v7** with dynamic nested paths.
- **State Management**: **Zustand v5** (for global client-side variables) & React Contexts (for authentication and socket handshakes).
- **Interactive Visualizations**: **ApexCharts**, **Recharts**, and **reactflow** (for vulnerability graphs, attack mapping, and compliance scoring).
- **3D & Particles**: **Three.js** (`@react-three/fiber` & `@react-three/drei`) and **tsparticles** (delivering a premium cybersecurity dark-theme dashboard with interactive particles and reactive components).
- **Animations**: **Framer Motion v12** and **GSAP v3** (smooth transitions, slide-ins, and typing elements).
- **Rich Text Rendering**: **react-markdown** paired with `rehype-highlight` and `remark-gfm` for beautiful, syntax-highlighted code remediation blocks.

---

## 4. Backend Architecture (Server API)

The backend is structured under an adapted **Clean Architecture** utilizing **Modular Controller-Route Patterns** grouped by functional modules, optimizing testing and vertical scaling.

### Architectural Core:
- **Runtime Environment**: Node.js utilizing the Express 5 framework.
- **Real-Time Gateway**: Socket.IO server running alongside the Express HTTP service, establishing persistent full-duplex TCP tunnels.
- **Worker Queues**: **BullMQ** (powered by Redis client) which schedules and runs long-running security scans on background threads, preventing HTTP blockages.
- **Production Enhancements**:
  - **Trust Proxy**: Enabled (`app.set("trust proxy", 1)`) to ensure precise IP resolution behind reverse proxies (like Render, AWS ALB, Cloudflare).
  - **CORS Management**: Enforces strict origin matching, allowing local React host and deployed production clients with credential passing.
  - **Security Shields**: Enforced by `helmet` (content security policy, frameguards) and Express payload rate-limiting (restricting payloads to `2mb` to prevent memory buffer exhaustion attacks).
  - **Compression**: Gzip compression applied on response streams to optimize payload deliveries.

---

## 5. Endpoints & API Route Catalog

The Express server exposes a comprehensive RESTful routing grid grouped under the `/api` prefix. Below is the complete catalog of routes:

### 1. Authentication Routing (`/api/auth`)
- **POST `/google-login`**: Accepts user details (`name`, `email`) from successful Firebase client handshakes, registers/logs in the user, and returns access and refresh JWT tokens.
- **POST `/register`**: Traditional analyst credentials signup.
- **POST `/login`**: Validates credentials and returns JWT session variables.
- **POST `/refresh`**: Rotates expired Access JWTs using persistent Refresh tokens.
- **POST `/logout`**: Invalidates refresh tokens inside the database.

### 2. Scanner Configuration & Execution (`/api/scans`)
- **POST `/`**: Triggers a new security scan against a requested `targetUrl` (enqueues or runs in-process).
- **GET `/`**: Lists all scans ran by the authenticated analyst.
- **GET `/:id/progress`**: Retrieves the live progress percentage and scanner statuses.
- **GET `/:id/findings`**: Lists all vulnerabilities discovered under a specific scan ID.
- **DELETE `/:id`**: Aborts and deletes scan histories.

### 3. Vulnerabilities & Findings (`/api/vulnerabilities`)
- **GET `/`**: Browses the global catalog of discovered vulnerabilities across all assets.
- **GET `/:id`**: Retrieves specific technical analysis, evidence snippets, CVSS scores, and CWE indicators.
- **PATCH `/:id/verify`**: Manually flags a finding as Verified / False Positive.

### 4. AI Copilot Integration (`/api/copilot`)
- **GET `/models`**: Returns the list of active models available for chat (GPT-4o, Claude, DeepSeek, etc.).
- **GET `/conversations`**: Lists chat histories of the authenticated analyst.
- **POST `/conversations`**: Instantiates a new chat session.
- **DELETE `/conversations/:id`**: Cascade deletes conversation and child messages.
- **POST `/conversations/:id/messages`**: Main API Brain. Sends user prompt along with attachments, extracts context, checks RAG, auto-learns semantic facts in the background, and returns the AI reply.
- **GET `/memories`**: Returns learned facts (auth headers, endpoints, staging configs) automatically harvested from chat.
- **POST `/memories`** / **DELETE `/memories/:id`**: Manual override to manage AI context memories.

### 5. Automated Intelligence Analysis (`/api/ai`)
- **POST `/analyze`**: Submits a single vulnerability payload, orchestrating OpenRouter/Local AI models to return a complete, structured vulnerability intelligence dossier.
- **POST `/export-pdf`**: Exports the technical AI analysis into a beautifully typeset PDF report.

### 6. Background Queue Monitor (`/api/queue`)
- **GET `/metrics`**: Reads Redis BullMQ keys to return job metrics (waiting, active, delayed, failed counts) for real-time queue rendering.

---

## 6. Authentication & Sockets Security

Security is deeply integrated throughout the network layer of the API platform.

```text
======================= HANDSHAKE & SESSION AUTH FLOW =======================

   [ Client SPA ]                                     [ Backend Server ]
         │                                                    │
         ├────── (1) Google Auth / Traditional Sign-In ──────>│
         │                                                    │
         │<───── (2) Returns Access JWT + Refresh Token ──────┤
         │                                                    │
         │                                                    │
   ============ ESTABLISHING REAL-TIME WEBSOCKET TUNNEL ============
         │                                                    │
         ├────── (3) io.connect() { auth: { token: JWT } } ──>│
         │                                                    │ [ Socket Auth Middleware ]
         │                                                    │ ──── Verify JWT signature
         │                                                    │ ──── Resolve user from DB
         │                                                    │
         │<───── (4) Connection Approved (TCP Established) ───┤
         │                                                    │
         │                                                    │
   ============ SECURING PAGE ROUTES (CLIENT NAVIGATION) ============
         │
   [ Route Guards ]
   Matches route requests
   against active User state.
   Redirects to /login
   if JWT is missing.
```

### Key Elements:
1. **Dynamic Authentication Exchange**: The frontend connects to Firebase for federated Google Single-Sign-On. Upon validation, the raw profile is securely exchanged with the Node.js server, generating an app-specific JWT. This completely avoids storing Firebase secrets on client files and keeps JWT generation fully controlled by the backend.
2. **Access + Refresh Token Lifespans**:
   - Access tokens are short-lived (usually 15 minutes) and are sent inside the `Authorization: Bearer <token>` request header.
   - Refresh tokens are long-lived and securely tracked inside the user's database entry to rotate access tokens.
3. **Socket Handshake Guarding**: Real-time Socket.IO tunnels are locked down. The server interceptor (`sockets/socket.auth.middleware.js`) decodes the socket's `auth.token` parameter. If invalid or missing, it rejects connection, preventing unauthenticated clients from connecting to the server.
4. **Tenant Scoping (Rooms)**: Upon auth, the socket joins a unique private room (`user:<userId>`). All subsequent real-time messages are dispatched exclusively within this room, preventing data leakage across concurrent users.

---

## 7. Database Architecture & Models

The database tier is designed on MongoDB using Mongoose schemas. It is split into distinct functional collections:

### 1. User Schema (`User`)
- Stores profile credentials (`name`, `email`, encrypted `passwordHash`).
- Manages user authorization levels (`role`: `admin`, `analyst`, `user`).
- Tracks active sessions (`refreshTokens` arrays) and soft delete flags (`isDeleted`).
- **Indexes**: Compound index on `email` + `isDeleted` and `role` + `isDeleted` for ultra-fast query execution.

### 2. Scan Schema (`Scan`)
- Records individual scanner configurations (`targetUrl`, `assetName`, `profile`, `status`).
- Aggregates vulnerability finding tallies (`criticalCount`, `highCount`, `mediumCount`, `lowCount`, `totalFindings`).
- Stores final health scoring calculations (`securityScore`, calculated `grade` (A-F), and compound `riskScore`).
- Manages timeline lifecycles (`startedAt`, `completedAt`, calculated scan `duration`).

### 3. Vulnerability Schema (`Vulnerability`)
- Tracks deep vulnerability disclosures.
- Relates back to a parent scan via MongoDB object references (`scanId`).
- Core Fields: `title`, `description`, `recommendation`, `severity`, `cwe`, `owasp` category, and `cvss` vector score.
- Dynamic Proof-of-Concept (PoC) Fields: `verified` boolean, fuzzer `exploitPayload`, targeted `vulnerableParameter`, `evidenceSnippet` (HTTP responses), and `endpoint` URI path.

### 4. Copilot Models
- **CopilotConversation**: Manages chat sessions (`userId`, `title`, `isPinned`, `isArchived`, `lastModel`).
- **CopilotMessage**: Logs chat history messages (`conversationId`, sender type (`user` / `assistant`), `text`, and metadata attachments).
- **CopilotMemory**: Semantic context memories (`userId`, `text` statement, and `category` classification: Authentication, Infrastructure, Security, General).
- **CopilotTrainingPair**: Stores few-shot system fine-tuning examples (`userId`, `prompt`, `response`).

---

## 8. AI Modules & Copilot Pipeline

The AI architecture is a cornerstone of the platform, combining vulnerability auto-triage with an interactive, hyper-contextual copilot.

```text
===================== ATHX AI COPILOT PIPELINE =====================

         [ User Prompt + Attachments (ZIP/PDF/DOCX) ]
                             │
                             ▼
         [ Extract File Content (binary-to-string parse) ]
                             │
                             ▼
         [ RAG: Query Security Playbooks Markdown KB ]
                             │
                             ▼
         [ Context: Inject User Memories + Scan Stats ]
                             │
                             ▼
         [ Web Search: Scrape Live Google Excerpts (optional) ]
                             │
                             ▼
       ┌─────────────────────┴─────────────────────┐
       ▼                                           ▼
[ AI Engine Active ]                      [ AI Engine Offline ]
Query Free Pollinations Endpoint          Generate pre-packaged Interactive
(GPT-4o, Sonnet, DeepSeek)                Security Report via Offline Fallback
       │                                           │
       └─────────────────────┬─────────────────────┘
                             │
                             ▼
                [ AI Response stream to UI ]
                             │
                       (Background)
                             │
                             ▼
     [ Fact Extractor: Parse statements from AI Reply ]
                             │
                             ▼
             [ Auto-Save Context to CopilotMemory ]
```

### 1. The Vulnerability Intelligence Dossier Engine
- Triggered on-demand when analyzing scan findings.
- Resolves the vulnerability structure, feeding it into OpenRouter.
- Utilizes a complex system instruction set (`security-analysis.prompt.js`) ensuring output matches a highly restrictive JSON schema (`output.schema.js`).
- **Local Fallback Report Generator**: In the event of network disruption, API timeouts, or missing OpenRouter keys, the module immediately delegates processing to a local deterministic rules engine (`openrouter.service.js`). This local generator produces a detailed, multi-section markdown dossier containing risk ratings, technical observed gaps, attack progressions, and tailored copy-pasteable remediation patches.

### 2. Security Copilot (ATHX AI) Core Features
- **Keyless Pollinations Integration**: Leverages keyless access to text.pollinations.ai, hosting multiple models including GPT-4o-Mini, Claude 3.5 Sonnet, DeepSeek V3, Llama 3.1, and Qwen.
- **Multi-Format Attachment Parsing**: Evaluates developer artifacts. Supports uploading source code or binary files, extracting text from:
  - **ZIP Archives**: Recursively unpacks code files and runs ASCII strings extraction over binary files inside.
  - **PDF Documents**: Parsed with `pdf-parse`.
  - **MS Word (.docx)**: Compares raw XML structural components to extract pure strings.
  - **Excel Spreadsheets (.xlsx)**: Maps shared string databases and compiles sheets into readable tab-delimited layouts.
- **Dynamic Retrieval-Augmented Generation (RAG)**: Integrates a local compendium security rules file (`system_prompt_knowledgebase.md`). The controller executes local vector-like searches matching queries with specific playbooks (e.g. CSRF, SSRF, BOLA, JWT, Cloud Deployment, and WAF rules) injecting them directly into the LLM system prompt.
- **Auto-Learning Cognitive Memory Loop**: Includes a background process that reviews chat responses to extract new, specific facts (such as staging server endpoints, database keys, or custom headers) and automatically registers them into MongoDB as user memories. These memories are dynamically prepended to all future chat payloads, ensuring the AI permanently remembers the developer's infrastructure configuration.
- **Web Search Integration**: When users query current issues, the backend performs live Google/Bing queries, extracts excerpts, structures inline citations (`[Source](URL)`), and dynamically appends references.
- **Offline Fallback Engine**: If Pollinations or internet access drops, the controller intercepts the crash, routing queries through a local offline analyzer (`copilot.controller.js`). This offline engine serves context-aware interactive security analyses and checklists based on keywords.

---

## 9. Scanning Engines & web Crawlers

When a scan is scheduled, the system starts a comprehensive multi-threaded fuzzer suite.

### Core Modules:
1. **Web Crawler (`web-crawler.service.js`)**: Explores target directory paths, forms, and anchors, building an API mapping directory used by subsequent vulnerability scripts.
2. **Security Headers (`security-header.scanner.js`)**: Evaluates missing defensive HTTP attributes (CSP, X-Frame-Options, HSTS, Referrer-Policy).
3. **SSL/TLS (`ssl.scanner.js`)**: Audits certificate handshakes, checking cipher strengths and TLS versions.
4. **CORS Policy (`cors.scanner.js`)**: Detects wildcard origin exposures (`Access-Control-Allow-Origin: *`) coupled with credential permissions.
5. **Cookie Integrity (`cookie.scanner.js`)**: Validates the presence of `HttpOnly`, `Secure`, and `SameSite` flags.
6. **JWT Vulnerabilities (`jwt.scanner.js`)**: Evaluates tokens for weak signatures, `none` algorithm vulnerability, and empty signatures.
7. **Active Fuzzers**:
   - **SQL Injection (`sql-injection.scanner.js`)**: Runs SQL syntax payloads (boolean-based and error-based payloads) against endpoints and parameter routes.
   - **Cross-Site Scripting (`xss.scanner.js`)**: Checks injection paths for reflected and stored HTML payloads.
   - **Path Traversal (`path-traversal.scanner.js`)**: Probes parameters for file directory traversal signatures (`../../etc/passwd`).
   - **Command Injection (`command-injection.scanner.js`)**: Tests payload executions such as shell commands (`whoami`, `id`).
   - **Exposed Assets (`exposed-files.scanner.js`)**: Probes for backup databases, config assets, `.git` archives, and `.env` files.

---

## 10. Summary of Project Strengths

- **Graceful Failover**: Scalable BullMQ/Redis worker queues that fallback to async local processes if Redis is offline.
- **AI Resilience**: Highly optimized AI modules that degrade gracefully into local deterministic reporting engines.
- **Real-Time Responsiveness**: Persistent WebSocket loops tracking latency in milliseconds, keeping analysts up-to-date with active fuzzers.
- **State-of-the-Art Aesthetic**: A dark-mode security console with Framer Motion, GSAP, and Three.js elements.
- **Cognitive Copilot**: A RAG-driven AI helper that auto-learns environment setups, reads documents, and performs live search queries.
