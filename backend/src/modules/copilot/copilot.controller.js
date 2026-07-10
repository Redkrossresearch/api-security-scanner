const mongoose = require("mongoose");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const config = require("../../config/env");
const { CopilotConversation, CopilotMessage, CopilotMemory, CopilotTrainingPair } = require("./copilot.model");
const Scan = require("../scans/scan.model");
const Setting = require("../settings/setting.model");
const { SYSTEM_PROMPT } = require("./copilot.prompts");
const { searchWeb } = require("./search.service");

// ─── Model Registry ────────────────────────────────────────────────────────────
const MODEL_REGISTRY = {
  "openai/gpt-oss-120b:free": {
    label: "GPT-OSS 120B",
    provider: "OpenAI",
    contextWindow: 131072,
    strengths: ["reasoning", "coding", "analysis"],
    badge: "🔥"
  },
  "google/gemma-4-31b-it:free": {
    label: "Gemma 4 31B",
    provider: "Google",
    contextWindow: 262144,
    strengths: ["multimodal", "instruction-following", "long-context"],
    badge: "✨"
  },
  "meta-llama/llama-3.2-3b-instruct:free": {
    label: "Llama 3.2 3B",
    provider: "Meta",
    contextWindow: 131072,
    strengths: ["fast", "lightweight", "general"],
    badge: "⚡"
  },
  "nvidia/nemotron-ultra-253b-v1:free": {
    label: "Nemotron Ultra 253B",
    provider: "Nvidia",
    contextWindow: 131072,
    strengths: ["security", "technical", "deep-analysis"],
    badge: "🛡️"
  },
  "deepseek/deepseek-r1:free": {
    label: "DeepSeek R1",
    provider: "DeepSeek",
    contextWindow: 65536,
    strengths: ["reasoning", "math", "code"],
    badge: "🧠"
  },
  "mistralai/mistral-7b-instruct:free": {
    label: "Mistral 7B",
    provider: "Mistral AI",
    contextWindow: 32768,
    strengths: ["fast", "instruction-following"],
    badge: "🌪️"
  },
  "meta-llama/llama-3.1-8b-instruct:free": {
    label: "Llama 3.1 8B",
    provider: "Meta",
    contextWindow: 131072,
    strengths: ["coding", "agents", "multilingual"],
    badge: "🤖"
  },
  "qwen/qwen-2.5-7b-instruct:free": {
    label: "Qwen 2.5 7B",
    provider: "Alibaba",
    contextWindow: 32768,
    strengths: ["coding", "structured-output", "speed"],
    badge: "🔴"
  },
  "google/gemma-2-9b-it:free": {
    label: "Gemma 2 9B",
    provider: "Google",
    contextWindow: 8192,
    strengths: ["conversational", "reasoning"],
    badge: "🪐"
  },
  "microsoft/phi-3-medium-128k-instruct:free": {
    label: "Phi 3 Medium",
    provider: "Microsoft",
    contextWindow: 131072,
    strengths: ["reasoning", "math", "logic"],
    badge: "🧬"
  },
  "meta-llama/llama-3-8b-instruct:free": {
    label: "Llama 3 8B",
    provider: "Meta",
    contextWindow: 8192,
    strengths: ["fast", "creative", "general"],
    badge: "🛸"
  },
  "cognitivecomputations/dolphin-mixtral-8x7b:free": {
    label: "Dolphin Mixtral",
    provider: "Cognitive Computations",
    contextWindow: 32768,
    strengths: ["uncensored", "coding", "general"],
    badge: "🐬"
  }
};

const DEFAULT_MODEL = "google/gemma-4-31b-it:free";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

// ─── Helper: Build enriched system prompt ──────────────────────────────────────
const buildEnrichedSystemPrompt = (systemStats, modelId, memories = [], promptTemplate = SYSTEM_PROMPT) => {
  const modelInfo = MODEL_REGISTRY[modelId] || {};
  const memoryText = memories.map((m) => `- [${m.category}] ${m.text}`).join("\n");
  
  return `${promptTemplate}

================================================================================
## USER CONTEXT MEMORIES (User Preferences & Info)
${memoryText || "- No preferences stored."}

================================================================================
## LIVE WORKSPACE CONTEXT (Real-Time Data)
- Active Vulnerability Scans: ${systemStats.scanCount}
- Total Critical Findings: ${systemStats.criticalCount}
- High Severity Findings: ${systemStats.highCount}
- Latest Scan Target: ${systemStats.topTarget}
- Most Recent Scan Status: ${systemStats.lastScanStatus}
================================================================================
## RESPONSE FORMATTING INSTRUCTIONS
1. Use ASCII flowcharts in \`\`\`text blocks for architecture diagrams.
2. Use comparative markdown tables for risk matrices and before/after patches.
3. Include complete, copy-pasteable code with correct language tags.
4. Use H3 (###) and H4 (####) headers to organize sections.
5. Reference workspace scan data when relevant to the query.
6. Always include specific remediation steps, not generic advice.
================================================================================
## ENGINE: ${modelInfo.label || modelId} (${modelInfo.provider || "OpenRouter"})
Strengths: ${(modelInfo.strengths || []).join(", ")}
`;
};

// ─── Helper: Build context-aware message history ────────────────────────────────
const buildMessageHistory = async (conversationId, userQuery, limit = 12) => {
  try {
    const history = await CopilotMessage.find({ conversationId })
      .sort({ createdAt: -1 })
      .limit(limit);
    const ordered = history.reverse();

    const messages = ordered.map((m) => ({
      role: m.sender === "user" ? "user" : "assistant",
      content: m.text,
    }));

    return messages;
  } catch (err) {
    console.warn("[copilot] History retrieval failed:", err.message);
    return [{ role: "user", content: userQuery }];
  }
};

// ─── Helper: Query Security Prompt Knowledge Base (RAG) ─────────────────────
const queryKnowledgeBase = (userQuery) => {
  try {
    const kbPath = path.join(__dirname, "system_prompt_knowledgebase.md");
    if (!fs.existsSync(kbPath)) return "";

    const content = fs.readFileSync(kbPath, "utf8");
    const sections = content.split("## SECTION ");
    const matches = [];

    const queryLower = userQuery.toLowerCase();

    for (const section of sections) {
      if (!section.trim()) continue;
      const firstLine = section.split("\n")[0];
      const sectionLower = firstLine.toLowerCase();

      if (
        queryLower.includes(sectionLower.split(":")[0].trim().toLowerCase()) ||
        sectionLower.includes(queryLower) ||
        (queryLower.includes("sql") && sectionLower.includes("sqli")) ||
        (queryLower.includes("jwt") && sectionLower.includes("api2")) ||
        (queryLower.includes("bola") && sectionLower.includes("api1")) ||
        (queryLower.includes("idor") && sectionLower.includes("api1")) ||
        (queryLower.includes("auth") && sectionLower.includes("api2")) ||
        (queryLower.includes("csrf") && sectionLower.includes("csrf")) ||
        (queryLower.includes("ssrf") && sectionLower.includes("api7")) ||
        (queryLower.includes("rce") && sectionLower.includes("rce")) ||
        (queryLower.includes("xss") && sectionLower.includes("xss")) ||
        (queryLower.includes("headers") && sectionLower.includes("api8")) ||
        (queryLower.includes("deployment") && sectionLower.includes("compendium")) ||
        (queryLower.includes("cloud") && sectionLower.includes("compendium"))
      ) {
        matches.push("## SECTION " + section.trim());
      }
    }

    if (matches.length > 0) {
      return `\n================================================================================\n## ACTIVE COMPENDIUM SECURITY RULES & PLAYBOOKS (Dynamically Retrieved from Prompt File)\n${matches.slice(0, 2).join("\n\n")}\n`;
    }
    return "";
  } catch (err) {
    console.error("[copilot] RAG query failed:", err.message);
    return "";
  }
};

// ─── Helper: Fetch scan stats ────────────────────────────────────────────────
const fetchScanStats = async (userId) => {
  const stats = {
    scanCount: 0,
    criticalCount: 0,
    highCount: 0,
    topTarget: "No scans yet",
    lastScanStatus: "N/A",
  };
  try {
    const scans = await Scan.find({ userId }).sort({ createdAt: -1 }).limit(20);
    if (scans && scans.length > 0) {
      stats.scanCount = scans.length;
      stats.topTarget = scans[0].targetUrl || "Unknown";
      stats.lastScanStatus = scans[0].status || "completed";
      stats.criticalCount = scans.reduce(
        (acc, s) => acc + (s.criticalCount || 0),
        0
      );
      stats.highCount = scans.reduce(
        (acc, s) => acc + (s.highCount || 0),
        0
      );
    }
  } catch (err) {
    console.warn("[copilot] DB stats failed:", err.message);
  }
  return stats;
};

const callOpenRouter = async (messages, systemPrompt, model, temperature, trainingPairs = []) => {
  const modelId = model || DEFAULT_MODEL;
  const temp = Math.min(Math.max(parseFloat(temperature) || 0.7, 0.1), 1.5);

  const formattedTraining = [];
  for (const pair of trainingPairs) {
    formattedTraining.push({ role: "user", content: `Example input: ${pair.prompt}` });
    formattedTraining.push({ role: "assistant", content: `Expected output: ${pair.response}` });
  }

  const fullMessages = [
    { role: "system", content: systemPrompt },
    ...formattedTraining,
    ...messages
  ];

  const response = await axios.post(
    OPENROUTER_URL,
    {
      model: modelId,
      messages: fullMessages,
      temperature: temp,
      max_tokens: 4096,
      stream: false,
    },
    {
      headers: {
        Authorization: `Bearer ${config.openRouterApiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": config.clientUrl || "http://localhost:5173",
        "X-Title": "ATHX AI Security Copilot",
      },
      timeout: 60000,
    }
  );

  const content = response.data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty response from model");
  return { content, model: modelId };
};

// ─── Intelligent Fallback Engine ─────────────────────────────────────────────
const generateContextualFallback = (query, systemStats) => {
  const q = query.toLowerCase();
  const { scanCount, criticalCount, topTarget } = systemStats;

  const intro = `### 🤖 ATHX AI — Offline Analysis Mode
> ⚠️ **Live AI engine temporarily unavailable.** Displaying local intelligent response.

**Query**: "${query}"
**Workspace**: ${scanCount} scans | ${criticalCount} criticals | Target: \`${topTarget}\`

---

`;

  if (q.includes("sql") || q.includes("sqli") || q.includes("injection")) {
    return intro + `#### 🚨 SQL Injection (CWE-89) Analysis

**CVSS Score**: 9.8 Critical | **OWASP**: API10:2023

#### Root Cause
Raw user input concatenated directly into SQL queries without parameterization.

#### Attack Flow
\`\`\`text
Attacker Input: admin' OR '1'='1' --
       │
       ▼
[ Express Controller ]
       │  No validation
       ▼
[ Database: SELECT * WHERE user = 'admin' OR '1'='1' -- ]
       │
       ▼ ✅ Auth Bypassed — All records exposed
\`\`\`

#### ❌ Vulnerable Pattern
\`\`\`javascript
// NEVER DO THIS
const query = \`SELECT * FROM users WHERE email = '\${req.body.email}'\`;
db.query(query);  // SQL injection possible
\`\`\`

#### ✅ Secure Remediation
\`\`\`javascript
// Parameterized query — completely safe
const query = "SELECT * FROM users WHERE email = ? AND password = ?";
db.execute(query, [req.body.email, hashedPassword], (err, results) => {
  if (err) return res.status(500).json({ error: "Server error" });
  if (!results.length) return res.status(401).json({ error: "Invalid credentials" });
  res.json({ user: sanitize(results[0]) });
});
\`\`\`

#### Remediation Checklist
| Control | Status | Action |
|---|---|---|
| Parameterized Queries | 🔴 FAILING | Replace string concatenation |
| Input Validation | 🟡 CHECK | Add joi/zod schema validation |
| Error Handling | 🔴 FAILING | Never expose DB errors to client |
| ORM Usage | 🟢 RECOMMENDED | Use Mongoose/Sequelize/Prisma |`;
  }

  if (q.includes("jwt") || q.includes("token") || q.includes("auth")) {
    return intro + `#### 🔐 JWT Authentication Security Analysis

**CVSS Score**: 8.8 High | **OWASP**: API2:2023

#### Secure JWT Implementation
\`\`\`javascript
const jwt = require("jsonwebtoken");

// ✅ Signing — use RS256 or HS256 with strong secret
const token = jwt.sign(
  { userId: user._id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: "15m", algorithm: "HS256" }
);

// ✅ Verification Middleware
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing authorization header" });
  }
  
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],  // Reject alg:none attacks
    });
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};
\`\`\`

#### Security Checklist
| Check | Status | Fix |
|---|---|---|
| Algorithm pinning (reject alg:none) | ⚠️ VERIFY | Specify algorithms array |
| Short expiry (≤15min access token) | ⚠️ VERIFY | Set expiresIn: "15m" |
| Refresh token rotation | 🔴 IMPLEMENT | Rotate on every use |
| Token blacklisting on logout | 🔴 IMPLEMENT | Redis blocklist |`;
  }

  if (q.includes("scan") || q.includes("vulnerability") || q.includes("finding")) {
    return intro + `#### 🛡️ Workspace Security Status Report

#### Current Threat Landscape
| Metric | Value | Risk Level |
|---|---|---|
| Total Scans Executed | ${scanCount} | — |
| Critical Vulnerabilities | ${criticalCount} | ${criticalCount > 5 ? "🔴 HIGH" : criticalCount > 0 ? "🟡 MEDIUM" : "🟢 LOW"} |
| Primary Target | \`${topTarget}\` | Active |

#### Recommended Actions
1. **Immediate**: Triage all ${criticalCount} critical findings with CVSS ≥ 9.0
2. **This Week**: Run authenticated scans on \`${topTarget}\` API endpoints
3. **This Month**: Implement continuous scanning in CI/CD pipeline

#### Next Scan Suggestions
\`\`\`bash
# Authenticated endpoint scan
curl -X GET "${topTarget}/api/users/1" \\
  -H "Authorization: Bearer <token>" \\
  -H "X-Forwarded-For: 127.0.0.1"

# BOLA/IDOR test — try accessing other users' data
curl -X GET "${topTarget}/api/users/2" \\
  -H "Authorization: Bearer <your-token>"
\`\`\``;
  }

  // Default high-quality general response
  return intro + `#### 🧠 Security Architecture Analysis

I've analyzed your query in the context of your workspace with **${scanCount} scans** and **${criticalCount} critical findings**.

#### Defense-in-Depth Architecture
\`\`\`text
┌─────────────────────────────────────────────────────────┐
│                    CLIENT REQUEST                        │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│               API GATEWAY / LOAD BALANCER                │
│  • Rate limiting (100 req/15min per IP)                  │
│  • TLS 1.3 termination                                   │
│  • WAF rules (OWASP Core Rule Set)                       │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              APPLICATION MIDDLEWARE STACK                │
│  • JWT verification + RBAC                               │
│  • Input validation (Joi/Zod schema)                     │
│  • Request sanitization (DOMPurify / validator.js)       │
│  • CORS policy enforcement                               │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│                  BUSINESS LOGIC LAYER                    │
│  • Object-level authorization checks (BOLA prevention)   │
│  • Function-level authorization (BFLA prevention)        │
│  • Parameterized database queries                        │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│                   DATA LAYER                             │
│  • Encryption at rest (AES-256)                          │
│  • Principle of least privilege DB user                  │
│  • Audit logs for all mutations                          │
└─────────────────────────────────────────────────────────┘
\`\`\`

#### Priority Security Controls
| Control | Implementation | Priority |
|---|---|---|
| Input Validation | Joi schema on all POST/PUT endpoints | 🔴 Critical |
| Authentication | JWT RS256 + short expiry + refresh rotation | 🔴 Critical |
| Authorization | Resource ownership checks on every query | 🔴 Critical |
| Rate Limiting | express-rate-limit per user + per IP | 🟡 High |
| Security Headers | Helmet.js with strict CSP | 🟡 High |
| Logging | Structured logs with Pino + Sentry | 🟢 Medium |

Ask me anything more specific about your \`${topTarget}\` setup!`;
};

// ═══════════════════════════════════════════════════════════════════════════════
// ROUTE HANDLERS
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/copilot/models
const getAvailableModels = (req, res) => {
  const models = Object.entries(MODEL_REGISTRY).map(([id, info]) => ({
    id,
    ...info,
  }));
  return res.json({ success: true, models });
};

// GET /api/copilot/conversations
const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const conversations = await CopilotConversation.find({
      userId,
      isArchived: { $ne: true },
    }).sort({ isPinned: -1, updatedAt: -1 });

    return res.json({ success: true, conversations });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/copilot/conversations
const createConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title } = req.body;

    const newConversation = new CopilotConversation({
      userId,
      title: title || "New Chat",
      isPinned: false,
      isArchived: false,
    });

    await newConversation.save();
    return res.status(201).json({ success: true, conversation: newConversation });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/copilot/conversations/:id
const updateConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, isPinned, isArchived } = req.body;

    const conversation = await CopilotConversation.findOne({ _id: id, userId });
    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    if (title !== undefined) conversation.title = title;
    if (isPinned !== undefined) conversation.isPinned = isPinned;
    if (isArchived !== undefined) conversation.isArchived = isArchived;

    await conversation.save();
    return res.json({ success: true, conversation });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/copilot/conversations/:id/duplicate
const duplicateConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const original = await CopilotConversation.findOne({ _id: id, userId });
    if (!original) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    const copy = new CopilotConversation({
      userId,
      title: `${original.title} (Copy)`,
      isPinned: false,
      isArchived: false,
    });
    await copy.save();

    const originalMessages = await CopilotMessage.find({ conversationId: id }).sort({ createdAt: 1 });
    if (originalMessages.length > 0) {
      const copiedMessages = originalMessages.map((m) => ({
        conversationId: copy._id,
        sender: m.sender,
        text: m.text,
        timestamp: m.timestamp,
      }));
      await CopilotMessage.insertMany(copiedMessages);
    }

    return res.status(201).json({ success: true, conversation: copy });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/copilot/conversations/:id
const deleteConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid conversation ID" });
    }

    const conversation = await CopilotConversation.findOneAndDelete({ _id: id, userId });
    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    // Cascade delete all messages
    await CopilotMessage.deleteMany({ conversationId: id });

    return res.json({ success: true, message: "Conversation deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/copilot/conversations/:id/archive
const archiveConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const conv = await CopilotConversation.findOneAndUpdate(
      { _id: id, userId },
      { isArchived: true },
      { new: true }
    );
    if (!conv) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }
    return res.json({ success: true, conversation: conv });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/copilot/conversations/:id/messages
const getConversationMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const conversation = await CopilotConversation.findOne({ _id: id, userId });
    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    const messages = await CopilotMessage.find({ conversationId: id }).sort({ createdAt: 1 });
    return res.json({ success: true, messages });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/copilot/conversations/:id/messages — Main AI Brain
const handleChatRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, model, temperature, webSearch } = req.body;
    const userId = req.user.id;
    const userQuery = (message || "").trim();

    if (!userQuery) {
      return res.status(400).json({ success: false, message: "Message is required." });
    }

    // 1. Verify conversation ownership
    const conversation = await CopilotConversation.findOne({ _id: id, userId });
    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found." });
    }

    // 2. Save user message
    const userMsg = new CopilotMessage({
      conversationId: id,
      sender: "user",
      text: userQuery,
      timestamp: new Date(),
    });
    await userMsg.save();

    // 3. Auto-update conversation title on first message
    if (
      conversation.title === "New Chat" ||
      conversation.title === "New Chat Session" ||
      conversation.title === "New Conversation"
    ) {
      conversation.title =
        userQuery.length > 40
          ? userQuery.slice(0, 40) + "..."
          : userQuery;
    }
    conversation.updatedAt = new Date();
    if (model) conversation.lastModel = model;
    await conversation.save();

    // 4. Gather workspace context
    const systemStats = await fetchScanStats(userId);

    // 4b. Gather user context memories
    const userMemories = await CopilotMemory.find({ userId });

    // 4b2. Gather user few-shot training pairs
    const userTrainings = await CopilotTrainingPair.find({ userId });

    // 4c. Fetch user custom system prompt settings
    const userSettings = await Setting.findOne({ userId });
    const promptTemplate = userSettings?.customSystemPrompt?.trim() || SYSTEM_PROMPT;

    // 4d. Query security prompt knowledge base dynamically (RAG)
    const kbPromptContext = queryKnowledgeBase(userQuery);
    
    // Perform dynamic Web Search if requested by client
    let webContext = "";
    let searchResults = [];
    if (webSearch === true) {
      try {
        searchResults = await searchWeb(userQuery);
        if (searchResults && searchResults.length > 0) {
          webContext = `
================================================================================
## LIVE WEB SEARCH RESULTS (Grounding Context)
The user has enabled Web Search. Below are real-time search results matching the query:

${searchResults.map((res, i) => `[${i + 1}] "${res.title}"
   Source: ${res.url}
   Excerpt: ${res.snippet}`).join("\n\n")}

Formatting Instructions:
- Rely strictly on the search results for web facts. Do not invent details.
- Enforce INLINE CITATIONS: For every sentence, paragraph, or fact extracted from these sources, immediately append a clickable inline citation next to it referencing its source name and URL (e.g. "...according to the spec [OWASP](https://en.wikipedia.org/wiki/OWASP)..." or "...which exposes data [Code Injection](https://en.wikipedia.org/wiki/Code%20injection)...").
- Never summarize general concepts without citing their corresponding resource links inline.
================================================================================
`;
        }
      } catch (searchErr) {
        console.warn("[copilot] Web search helper failed:", searchErr.message);
      }
    }

    const combinedPrompt = promptTemplate + kbPromptContext + webContext;

    // 5. Build message history
    const selectedModel = model || DEFAULT_MODEL;
    const messageHistory = await buildMessageHistory(id, userQuery, 12);

    // 6. Build enriched system prompt
    const enrichedSystemPrompt = buildEnrichedSystemPrompt(systemStats, selectedModel, userMemories, combinedPrompt);

    let aiReplyText = "";
    let usedModel = selectedModel;
    let error = null;

    // 7. Call OpenRouter if API key is configured
    const hasApiKey =
      config.openRouterApiKey &&
      !config.openRouterApiKey.includes("YOUR_API_KEY") &&
      config.openRouterApiKey.trim() !== "";

    if (hasApiKey) {
      const modelRotation = [
        selectedModel,
        "openrouter/free",
        "google/gemma-4-31b-it:free",
        "nvidia/nemotron-3-ultra-550b-a55b:free",
        "cohere/north-mini-code:free",
        "tencent/hy3:free",
        "cognitivecomputations/dolphin-mistral-24b-venice-edition:free",
      ];
      
      const uniqueModels = Array.from(new Set(modelRotation));
      
      for (const currentTryModel of uniqueModels) {
        try {
          console.log(`[copilot] Attempting chat request using model: ${currentTryModel}`);
          const result = await callOpenRouter(
            messageHistory,
            enrichedSystemPrompt,
            currentTryModel,
            temperature || 0.7,
            userTrainings
          );
          aiReplyText = result.content;
          usedModel = result.model;
          error = null; // Clear error on success
          break; // Exit loop on success!
        } catch (apiErr) {
          error = apiErr.response?.data?.error?.message || apiErr.message;
          console.warn(`[copilot] Model ${currentTryModel} failed:`, error, JSON.stringify(apiErr.response?.data || {}));
        }
      }
    } else {
      error = "OpenRouter API key not configured in environment variables.";
    }

    // 8. Use local intelligent fallback if AI failed
    if (!aiReplyText) {
      aiReplyText = generateContextualFallback(userQuery, systemStats);
      if (error) {
        aiReplyText = `> [!WARNING]\n> **AI Engine Offline** — ${error}\n> Displaying intelligent local analysis.\n\n${aiReplyText}`;
      }
      usedModel = "local-fallback";
    }

    // 9. Save AI reply
    const assistantMsg = new CopilotMessage({
      conversationId: id,
      sender: "assistant",
      text: aiReplyText,
      timestamp: new Date(),
      metadata: { 
        model: usedModel,
        searchResults: searchResults || [],
      },
    });
    await assistantMsg.save();

    return res.json({
      success: true,
      reply: aiReplyText,
      conversationId: id,
      model: usedModel,
      searchResults: searchResults || [],
    });
  } catch (error) {
    console.error("[copilot] handleChatRequest error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getMemories = async (req, res) => {
  try {
    const userId = req.user?._id;
    const memories = await CopilotMemory.find({ userId }).sort({ createdAt: -1 });
    return res.json({ success: true, memories });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const createMemory = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { text, category } = req.body;
    if (!text?.trim()) {
      return res.status(400).json({ success: false, message: "Memory text is required" });
    }
    const newMemory = new CopilotMemory({
      userId,
      text: text.trim(),
      category: category || "General",
    });
    await newMemory.save();
    return res.json({ success: true, memory: newMemory });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const deleteMemory = async (req, res) => {
  try {
    const { id } = req.params;
    await CopilotMemory.findByIdAndDelete(id);
    return res.json({ success: true, message: "Memory deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getTrainings = async (req, res) => {
  try {
    const userId = req.user?._id;
    const trainings = await CopilotTrainingPair.find({ userId }).sort({ createdAt: -1 });
    return res.json({ success: true, trainings });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const createTraining = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { prompt, response } = req.body;
    if (!prompt?.trim() || !response?.trim()) {
      return res.status(400).json({ success: false, message: "Prompt and response are required" });
    }
    const newPair = new CopilotTrainingPair({
      userId,
      prompt: prompt.trim(),
      response: response.trim(),
    });
    await newPair.save();
    return res.json({ success: true, training: newPair });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const deleteTraining = async (req, res) => {
  try {
    const { id } = req.params;
    await CopilotTrainingPair.findByIdAndDelete(id);
    return res.json({ success: true, message: "Training pair deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getAvailableModels,
  getConversations,
  createConversation,
  updateConversation,
  duplicateConversation,
  deleteConversation,
  archiveConversation,
  getConversationMessages,
  handleChatRequest,
  getMemories,
  createMemory,
  deleteMemory,
  getTrainings,
  createTraining,
  deleteTraining,
};