SOCKET.IO REAL-TIME ARCHITECTURE
Implementation Prompt — API Security Scanner
A codebase-specific, copy-paste-ready prompt for your AI coding assistant (Claude Code / Cursor / Copilot / etc.)
Generated from analysis of: api-security-scanner (MERN + BullMQ/Redis)

How To Use This Document
This document is written as a single, self-contained prompt. Copy everything from "MASTER PROMPT START" to "MASTER PROMPT END" and paste it into your AI coding assistant (Claude Code, Cursor, Copilot Chat, etc.) inside your project root so it has file-system access to the repository.
Everything in the prompt below is tailored to your actual codebase — real file paths, real module names, real dependency versions, and the real polling code that currently exists in ScanExecutionPage.jsx and QueueMonitorPage.jsx — not a generic template.
NOTE: Anthropic's Claude does not write or debug malicious code, and this document does not contain any — it only contains an architecture/engineering prompt for your own application.

MASTER PROMPT START
(Copy from here ↓)
0. Role & Operating Mode
You are acting as Principal Software Architect, Senior Backend Engineer (Node.js/Express 5), Senior Frontend Engineer (React 19/Vite), and Real-Time Systems Engineer for the "api-security-scanner" project.
Do NOT blindly generate code. First analyze the existing architecture described below, confirm you understand it, then produce an Architecture Design Document for approval, and only then implement in small, independently-verifiable phases. Never perform a single massive refactor.
1. Current Architecture — Verified Facts About This Repo
This is what the codebase actually looks like today. Use it as ground truth; do not assume a different structure.
1.1 Backend stack
Entry point: backend/server.js — connects Mongo, starts scheduler.service.js, lazily boots Redis via getRedisClient(), conditionally starts the BullMQ worker, then app.listen(env.port).
App bootstrap: backend/src/app.js — Express 5 app; helmet, cors (origin allow-list from env.clientUrl), compression, morgan, cookie-parser, express.json({limit:'2mb'}).
Auth: backend/src/middleware/auth.middleware.js — reads Authorization: Bearer <token>, verifies with env.jwtAccessSecret (jsonwebtoken), loads req.user from Mongo. This SAME secret must be reused for Socket.IO auth — do not invent a new one.
Env vars in use: NODE_ENV, PORT, MONGODB_URI, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, CLIENT_URL, OPENROUTER_API_KEY, OPENROUTER_MODEL (backend/src/config/env.js).
Already installed: ioredis ^5, bullmq ^5.80 — a Redis connection and queue already exist. DO NOT install a second Redis client; reuse backend/src/queue/redis.client.js.
Not installed yet: socket.io (backend) and socket.io-client (frontend) — must be added.
Module layout: backend/src/modules/{auth,scans,scanner,queue,ai,copilot,dashboard,reports,vulnerabilities,settings,teams,history,engines,constants}/ — each module owns its own *.controller.js, *.routes.js, *.service.js, *.model.js. This convention must be preserved for the new socket module.
1.2 Scan execution pipeline (the main real-time candidate)
Queue definition: backend/src/queue/scan.queue.js — BullMQ Queue "scan-queue", enqueueScan(scanId, userId, targetUrl), getQueueMetrics(), getRecentJobs().
Worker: backend/src/queue/scan.worker.js — processScanJob(job) runs 18 scanners (security-header, ssl, cors, cookie, technology, server, jwt, rate-limit, openapi, api-inventory, attack-surface, endpoint-risk, sqli, xss, path-traversal, command-injection, exposed-files + crawler) via Promise.all, calls job.updateProgress() after each scanner via the tick() helper, then writes Scan + Vulnerability documents to Mongo and calls createReport().
Fallback mode: If Redis is unavailable, server.js logs 'Scans run in-process' — scan.service.js presumably contains an equivalent synchronous path. The socket layer must work in BOTH modes (BullMQ events when Redis is up, direct emit calls when it isn't).
REST endpoints today: POST /api/scans (create), GET /api/scans/:id/status (polled), GET /api/scans/:id, GET /api/scans/dashboard/* (summary, risk-distribution, activity, vulnerability-trends, leaderboard, heatmap, ai-insights) — backend/src/modules/scans/scan.routes.js.
1.3 Confirmed polling that Socket.IO must replace
frontend/src/pages/ScanExecutionPage.jsx — setInterval(async () => scanService.getScanStatus(scanId), 1500) inside handleStartScan(), stored in pollingRef, cleared on completed/failed/unmount. This is the #1 target: replace with a scan:progress / scan:completed / scan:failed listener.
frontend/src/pages/QueueMonitorPage.jsx — per-job setInterval(poll, 2000) stored in progressPollers.current[id], PLUS a global setInterval(fetchAll, 6000) for the whole queue view. Replace with queue:update and scan:progress room-scoped events.
frontend/src/hooks/useDashboard.js — fetch-on-mount dashboard hook; a natural consumer of a dashboard:update push event once scans complete, in addition to (not instead of) its initial REST fetch.
frontend/src/components/scans/LiveScannerLogs.jsx — component name implies it already expects live log data; currently has no live source. This becomes the primary consumer of scan:log.
1.4 AI / Copilot (currently fully request-response, not streaming)
backend/src/modules/ai/ai.controller.js — analyze() calls analyzeWithAI() (OpenRouter) and returns one JSON blob; exportPdf() streams a PDF file (not related to sockets).
backend/src/modules/copilot/copilot.controller.js — chat handling incl. file/zip/PDF parsing via adm-zip and pdf-parse, calls OpenRouter with SYSTEM_PROMPT, again returns one full response, no chunking today.
Both are strong candidates for ai:thinking / ai:stream / ai:stream:end since OpenRouter supports streaming completions — this is a genuine upgrade, not a fake real-time layer bolted onto a fake feature.
1.5 Frontend architecture
HTTP client: frontend/src/services/api.js (axios instance) + per-domain services: authService.js, dashboardService.js, reportService.js, scanService.js, settingService.js, vulnerabilityService.js — REST stays exactly as-is.
Auth context: frontend/src/contexts/AuthContext.jsx — holds the JWT used for REST calls today; the same token must be attached to the Socket.IO handshake (auth: { token } on io()), not re-implemented.
Routing: React Router v7 (frontend/src/App.jsx, routes/ProtectedRoute.jsx) — the Socket Provider must be mounted once inside the authenticated layout (MainLayout.jsx / AdminLayout.jsx), never per-page, to avoid duplicate connections.

2. Problems With The Current Approach
Fixed-interval polling (1.5s / 2s / 6s) wastes requests when a scan is idle and is too slow when a scanner finishes in under a second — users see stale progress bars.
QueueMonitorPage.jsx creates one setInterval PER visible job — with many concurrent scans this becomes O(n) timers hammering GET /api/scans/:id/status.
No live scanner log/vulnerability stream exists at all — LiveScannerLogs.jsx has nowhere to get data from except a final GET after completion.
AI/Copilot responses arrive as one big blob after the full OpenRouter call finishes — no perceived responsiveness during generation.
Every polling component re-implements its own cleanup/interval logic — duplicated, easy to leak (see progressPollers.current dictionary in QueueMonitorPage.jsx).
3. Proposed Architecture
Introduce Socket.IO as an additional transport layered ON TOP of the existing Express app and BullMQ worker — REST stays the system of record for CRUD/auth/config; Socket.IO becomes the system of record for anything that currently requires a poll.
3.1 Keep on REST (do not touch)
Authentication & refresh tokens — auth.routes.js
Scan creation, history, deletion — scan.routes.js
Reports, PDF export — report.routes.js
Settings, teams, vulnerability CRUD — setting.routes.js, team.routes.js, vulnerability.routes.js
File uploads inside copilot (zip/pdf parsing) — copilot.controller.js
3.2 Move to Socket.IO
Scan lifecycle: scan:start, scan:progress, scan:log, scan:vulnerability, scan:completed, scan:failed
Queue visibility: queue:update, queue:position, queue:metrics (replaces QueueMonitorPage.jsx polling entirely)
AI/Copilot streaming: ai:thinking, ai:stream:start, ai:stream, ai:stream:end
Dashboard push refresh: dashboard:update (fired after scan:completed, consumed by useDashboard.js as a cache-invalidation signal, not a replacement for its initial fetch)
System: connection:status, system:heartbeat, notification:new
4. Backend — Required New Module: backend/src/sockets/
Create a new top-level sibling to backend/src/modules/ so socket logic never mixes with REST controllers, matching this repo's existing per-concern module convention:
backend/src/sockets/
  index.js                    // createSocketServer(httpServer) — single entry point
  socket.server.js            // io = new Server(httpServer, {...}) + adapter hook (see 4.1)
  socket.auth.middleware.js   // io.use((socket,next)=>...) — reuses env.jwtAccessSecret + User model
  socket.connection.manager.js// tracks live sockets per userId, enforces per-user connection cap
  socket.rooms.js             // room-naming helpers: user:<id>, scan:<scanId>, team:<teamId>
  socket.event.registry.js    // single source of truth mapping event name -> handler + zod/joi schema
  socket.constants.js         // EVENT NAMES ONLY — see Section 6, never inline a string elsewhere
  socket.validation.js        // payload schema validation (reuse express-validator patterns already in repo)
  socket.error.handler.js     // wraps every handler, emits <namespace>:error, never leaks stack traces
  socket.logger.js            // thin wrapper around backend/src/utils/logger.js (reuse, do not fork)
  socket.health.js            // periodic system:heartbeat + system:health emitter
  socket.cleanup.js           // on('disconnect') teardown, idle-timeout sweep
  emitters/
    scan.emitter.js           // emitScanProgress(scanId, payload), emitScanLog(), emitVulnerability(), emitScanCompleted(), emitScanFailed()
    queue.emitter.js          // emitQueueUpdate(), emitQueuePosition()
    ai.emitter.js             // emitAiThinking(), emitAiStreamChunk(), emitAiStreamEnd()
    dashboard.emitter.js      // emitDashboardUpdate(userId)
    notification.emitter.js   // emitNotification(userId, payload)
  monitoring/                 // OPTIONAL, see Section 8 (Observability)
    socket.event.recorder.js
    socket.metrics.collector.js
4.1 Wire-up point (only 2 existing files touched)
backend/server.js — change app.listen(...) to const httpServer = http.createServer(app); const io = createSocketServer(httpServer); httpServer.listen(env.port, ...). Pass io into startScanWorker(redis, io) so the worker can call the emitters.
backend/src/queue/scan.worker.js — after each tick() call scanEmitter.emitScanProgress(scanId, { percent, currentScanner }); after Vulnerability.insertMany(...) call scanEmitter.emitVulnerability(...) per finding or batched; after dbScan.save() call scanEmitter.emitScanCompleted(scanId, summary); in the worker.on('failed', ...) handler call scanEmitter.emitScanFailed(scanId, err.message).
NOTE: These are the ONLY two existing files that need edits to get scan real-time working end-to-end. Everything else is additive. If Redis/BullMQ is unavailable and scans run in-process (see scan.service.js), the same emitter functions must be called from that code path too — locate it before writing code and confirm with the user which function names it uses.

5. Frontend — Required New Structure: frontend/src/sockets/
frontend/src/sockets/
  socketClient.js         // single io(SOCKET_URL, { auth: { token }, autoConnect:false }) instance
  SocketProvider.jsx      // mounted once in MainLayout.jsx / AdminLayout.jsx, connects using AuthContext token
  SocketContext.js        // React context exposing { socket, isConnected, latency }
  useSocket.js            // base hook: const { socket, isConnected } = useSocket()
  useSocketEvent.js       // reusable: useSocketEvent('scan:progress', handler, deps) — auto add/remove listener
  useScanRoom.js          // joins/leaves room scan:<scanId> on mount/unmount, wraps useSocketEvent for scan:* events
  ConnectionStatus.jsx    // small badge component consuming useSocket().isConnected
  reconnectManager.js     // exponential backoff config passed to socket.io-client, surfaces connection:status
5.1 Concrete refactors (exact components to change)
ScanExecutionPage.jsx — delete pollingRef / setInterval block (lines ~63, 78-101). Replace with useScanRoom(scanId) and useSocketEvent('scan:progress', setScanStatus) / useSocketEvent('scan:completed', ...) / useSocketEvent('scan:failed', ...). REST calls createScan() and the final getScanById() stay — sockets only replace the interval poll.
QueueMonitorPage.jsx — delete progressPollers.current dictionary and both setInterval calls (per-job poll + fetchAll 6000ms). Replace with a single useSocketEvent('queue:update', setQueueState) subscription; keep the initial REST fetch on mount for first paint.
LiveScannerLogs.jsx — becomes the first real consumer of scan:log via useScanRoom; append-only list, must cap in-memory log lines (e.g. keep last 500) to avoid unbounded memory growth on long scans.
useDashboard.js — add an optional useSocketEvent('dashboard:update', refetch) call that triggers its existing fetch function; do not change its REST logic.
Rule: components never call socketClient directly. They only use useSocket / useSocketEvent / useScanRoom. This satisfies the 'no duplicate listeners, no memory leaks' requirement because listener add/remove is centralized in one hook.
6. Event Architecture (authoritative — define once in socket.constants.js)
Event
Dir
Room
Fired from
Payload (shape)
connection:status
S→C
socket
socket.connection.manager.js
{ status, socketId, latency }
scan:start
S→C
scan:<id>
scan.controller.js create()
{ scanId, targetUrl, startedAt }
scan:progress
S→C
scan:<id>
scan.worker.js tick()
{ scanId, percent, currentScanner }
scan:log
S→C
scan:<id>
each scanner via scan.emitter.js
{ scanId, level, message, ts }
scan:vulnerability
S→C
scan:<id>
scan.worker.js after insertMany
{ scanId, finding }
scan:completed
S→C
scan:<id>, user:<id>
scan.worker.js after dbScan.save()
{ scanId, summary }
scan:failed
S→C
scan:<id>, user:<id>
scan.worker.js on('failed')
{ scanId, reason }
queue:update
S→C
user:<id>
queue.emitter.js on BullMQ events
{ waiting, active, completed, failed }
queue:position
S→C
scan:<id>
queue.emitter.js
{ scanId, position }
ai:thinking
S→C
user:<id>
ai.controller.js / copilot.controller.js
{ requestId }
ai:stream:start
S→C
user:<id>
ai.emitter.js
{ requestId }
ai:stream
S→C
user:<id>
ai.emitter.js (per OpenRouter chunk)
{ requestId, delta }
ai:stream:end
S→C
user:<id>
ai.emitter.js
{ requestId, full? }
dashboard:update
S→C
user:<id>
dashboard.emitter.js after scan:completed
{ reason }
notification:new
S→C
user:<id>
notification.emitter.js
{ id, type, message }
system:heartbeat
S→C
socket
socket.health.js (interval)
{ ts }
system:health
S→C
admin room
socket.health.js
{ cpu, mem, connections }

NOTE: Never hardcode an event-name string outside socket.constants.js (backend) / a matching frontend constants file. Import the constant everywhere.

7. Security Requirements — Reuse, Don't Reinvent
Handshake auth: io.use() middleware verifies the JWT from socket.handshake.auth.token using jsonwebtoken.verify(token, env.jwtAccessSecret) — same secret and same User model lookup as auth.middleware.js. Reject with an Error before connection completes if invalid.
Origin validation: Reuse the allowedOrigins array already built in app.js (['http://localhost:5173', env.clientUrl]) — pass the same array into the Socket.IO cors option instead of duplicating it.
Rate limiting: backend/src/middleware/rateLimiter.js already exists for REST (apiLimiter, authLimiter) — add an equivalent per-socket event rate limiter (e.g. token bucket keyed by socket.id) inside socket.error.handler.js so a single client cannot flood scan:log emission back at the server (client-emitted events only; most events here are server→client).
Room authorization: Before allowing a socket to join room scan:<scanId>, verify req.user (from the JWT) owns or is a team member of that scan — query Scan.findOne({_id, $or:[{userId},{teamId:{$in:user.teams}}]}) mirroring existing ownership checks in scan.controller.js.
Payload validation: Validate every inbound (client→server) payload with a schema before use — this repo already uses express-validator for REST; use zod or joi for socket payloads for consistency of style, documented in socket.validation.js.
Connection limits & idle timeout: Cap concurrent sockets per userId in socket.connection.manager.js; disconnect idle sockets that miss N consecutive heartbeats.
8. Performance & Scalability
Batch high-frequency events (e.g. scan:log) client-side with a small buffer + requestAnimationFrame flush in LiveScannerLogs.jsx to avoid re-rendering on every single line.
Room-scope everything — never io.emit() broadcast to all clients; always io.to(room).emit() so unrelated users' browsers receive nothing.
Because ioredis + bullmq are already dependencies, prepare (but do NOT wire up yet) the Redis adapter for horizontal scaling: add socket.io-redis-adapter as a devDependency note in the design doc, and structure socket.server.js so const { createAdapter } = require('@socket.io/redis-adapter') can be dropped in later using the existing getRedisClient() connection with zero other code changes.
Socket Cleanup Service (socket.cleanup.js) must remove room memberships and clear any per-connection buffers on disconnect to prevent memory growth under thousands of concurrent users.
9. Observability & Event Recording Layer (optional, isolated module)
If implemented, this must live entirely under backend/src/sockets/monitoring/ and attach via a single io.use() / io.on('connection', socket => socket.onAny(...)) hook — it must never appear inside business logic (scanner files, AI files, model files).
9.1 Capture per event
Event name, namespace, room, socket id, user id, timestamp, direction (in/out), payload size, processing time, latency, success/failure, error message, retry count.
9.2 Never capture
Passwords, JWTs/refresh tokens, API keys (OPENROUTER_API_KEY), cookies, Authorization headers, or full scan target credentials if any are ever added to a payload.
9.3 Modules
socket.event.recorder.js — ring-buffer in memory (bounded size) + optional Mongo capped collection for persistence.
socket.metrics.collector.js — counters/gauges: connections, events/sec, avg latency, dropped events, reconnect attempts.
9.4 Developer mode
A dev-only route/room (admin JWT role required) streams the live event timeline back over its own socket namespace — reuse the existing role-check pattern in authorize.middleware.js.
9.5 Retention & toggling
Recording must be togglable via an env flag (SOCKET_RECORDING_ENABLED) with zero code changes and a configurable retention window (e.g. SOCKET_RECORDING_RETENTION_HOURS).

10. Explicitly Do Not Touch
Any file under backend/src/modules/scanner/ (all 18 scanner algorithms) — only call their existing exported functions from the worker, never modify their internals.
backend/src/modules/engines/ (cvss-engine.js, risk-engine.js, security-score.engine.js, severity-engine.js) — scoring logic is untouched.
backend/src/modules/auth/* and auth.middleware.js — only READ env.jwtAccessSecret and the User model from here; never modify token issuance logic.
backend/src/modules/reports/* — report generation (report.service.js, pdfReport.service.js) stays REST-based, unchanged.
Mongoose models (scan.model.js, vulnerability.model.js, auth.model.js, etc.) — no schema changes required for this work.
All existing REST route files — add nothing, remove nothing, except optionally the /api/scans/:id/status endpoint may be KEPT (not removed) as a fallback for non-socket clients.
11. Phased Implementation Plan
Every phase must leave the app fully functional and independently deployable. Do not start phase N+1 until phase N is verified.
Phase 0 — Architecture Design Document
Produce the full design doc (current architecture, problems, proposed architecture, folder/file structure, event table, security/auth flow, connection lifecycle, error/reconnect strategy, Redis-adapter roadmap, risks, rollback plan) and WAIT for explicit approval before touching any file.
Phase 1 — Backend Socket Skeleton (no real events yet)
npm install socket.io in backend/. Create backend/src/sockets/ scaffold. Wire httpServer + createSocketServer(httpServer) into server.js. Implement socket.auth.middleware.js reusing env.jwtAccessSecret. Verify: a client can connect and receive connection:status; REST endpoints still all work unchanged.
Phase 2 — Frontend Socket Skeleton
npm install socket.io-client in frontend/. Add SocketProvider/SocketContext/useSocket, mount once in MainLayout.jsx / AdminLayout.jsx using the JWT from AuthContext. Add ConnectionStatus.jsx somewhere visible (e.g. Sidebar.jsx). Verify: connection status badge shows connected after login, disconnected after logout.
Phase 3 — Scan Real-Time (the highest-value slice)
Implement scan.emitter.js, wire into scan.worker.js's tick()/insertMany/save/failed handlers (and the in-process fallback in scan.service.js if present). Implement useScanRoom + refactor ScanExecutionPage.jsx to drop its setInterval. Verify side-by-side: old REST getScanStatus() still works if sockets are disabled (feature flag), new socket path drives the same UI faster.
Phase 4 — Queue Monitor Real-Time
Implement queue.emitter.js hooked to BullMQ's queueEvents (waiting/active/completed/failed). Refactor QueueMonitorPage.jsx to drop both interval blocks in favor of queue:update. Verify with multiple concurrent scans that only the intended user's room receives updates.
Phase 5 — AI / Copilot Streaming
Switch openrouter.service.js and copilot's OpenRouter call to streaming mode; implement ai.emitter.js for ai:thinking/ai:stream/ai:stream:end; update the copilot chat UI (ChatWindow.jsx / MessageBubble.jsx / StreamingIndicator.jsx — note StreamingIndicator.jsx and ThinkingIndicator.jsx already exist as components, meaning the UI was designed for this and is currently unused/dormant) to render streamed deltas.
Phase 6 — Dashboard Push, Notifications, Observability
Wire dashboard:update after scan:completed into useDashboard.js as a refetch trigger. Add notification.emitter.js. Optionally add the monitoring/ module from Section 9 behind SOCKET_RECORDING_ENABLED.
Phase 7 — Hardening
Load-test with many simulated concurrent scans/users, verify per-user connection caps, idle timeouts, and cleanup; document the Redis-adapter drop-in point for future horizontal scaling; do NOT implement the adapter itself yet.
After every phase, output: Files Modified, Files Created, Breaking Changes (should be none), Manual Verification Checklist, Rollback Instructions (git revert scope for that phase only).
12. Risks To Call Out Before Coding
scan.service.js (the in-process/no-Redis fallback path) was not opened during this analysis — confirm its function names before assuming scan.worker.js is the only place that needs emitter calls.
Sticky sessions are required if this is ever deployed behind a load balancer without the Redis adapter — flag this explicitly in the design doc even though Phase 7 doesn't implement the adapter.
OpenRouter streaming support must be confirmed for the specific model in OPENROUTER_MODEL before Phase 5 begins.
Express 5 + Socket.IO on the same httpServer is fully supported but changes server.js's listen call shape — must not break the existing scheduler.service.start() / Redis bootstrap ordering.
13. Rollback Plan
Each phase lives in its own commit/PR; sockets are strictly additive so reverting a phase = deleting its new files + reverting the 1-2 touched lines in server.js / scan.worker.js.
Keep GET /api/scans/:id/status alive throughout as a non-socket fallback until Phase 7 sign-off, so ScanExecutionPage.jsx could theoretically revert to polling with a one-line change if sockets misbehave in production.
MASTER PROMPT END
(Copy up to here ↑)