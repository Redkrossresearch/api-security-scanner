const mongoose = require("mongoose");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const config = require("../../config/env");
const {
  CopilotConversation,
  CopilotMessage,
  CopilotMemory,
  CopilotTrainingPair,
} = require("./copilot.model");
const Scan = require("../scans/scan.model");
const Setting = require("../settings/setting.model");
const { SYSTEM_PROMPT } = require("./copilot.prompts");
const { searchWeb, cleanSearchQuery } = require("./search.service");
const AdmZip = require("adm-zip");
const pdfParse = require("pdf-parse");
const { retryWithBackoff } = require("./ai.resilience");
const llmRegistry = require("../llm/llm.registry");
const llmRouter = require("../llm/router/llm.router");
const llmGuardrails = require("../llm/router/llm.guardrails");

// Helper function to extract readable printable strings from binary data
function extractPrintableStrings(buffer) {
  let result = "";
  let currentString = "";
  for (let i = 0; i < buffer.length; i++) {
    const charCode = buffer[i];
    if (charCode >= 32 && charCode <= 126) {
      currentString += String.fromCharCode(charCode);
    } else {
      if (currentString.length >= 4) {
        result += currentString + "\n";
      }
      currentString = "";
    }
  }
  if (currentString.length >= 4) {
    result += currentString + "\n";
  }
  // limit to 15,000 characters to keep it reasonable
  return result.slice(0, 15000) || "[No readable strings found]";
}

// Robust multi-format parser supporting 100+ extensions
const parseAttachment = async (file) => {
  try {
    if (!file.content) {
      return "[Empty File Content]";
    }

    const isBase64 =
      typeof file.content === "string" && file.content.startsWith("data:");
    let buffer;
    if (isBase64) {
      const base64Data = file.content.split(";base64,").pop();
      buffer = Buffer.from(base64Data, "base64");
    } else {
      buffer = Buffer.from(file.content, "utf-8");
    }

    const filename = file.name || "unknown";
    const ext = filename.split(".").pop().toLowerCase();

    // 1. ZIP File Extraction
    if (ext === "zip" || file.type === "application/zip") {
      try {
        const zip = new AdmZip(buffer);
        const zipEntries = zip.getEntries();
        let zipText = `[ZIP Archive: ${filename} containing ${zipEntries.length} files]\n`;

        for (const entry of zipEntries) {
          if (entry.isDirectory) continue;

          const entryExt = entry.entryName.split(".").pop().toLowerCase();
          // Text-like formats
          const isText =
            /^(js|jsx|ts|tsx|py|java|c|cpp|h|cs|go|rs|rb|php|html|css|json|md|txt|yml|yaml|xml|sh|ini|conf|csv)$/i.test(
              entryExt,
            );

          const entryData = entry.getData();
          if (isText) {
            zipText += `\n--- Inside ZIP: ${entry.entryName} ---\n${entryData.toString("utf-8")}\n`;
          } else {
            // Binary files inside ZIP: extract ASCII strings
            const strings = extractPrintableStrings(entryData);
            zipText += `\n--- Inside ZIP (Binary): ${entry.entryName} ---\n[Extracted Strings]:\n${strings}\n`;
          }
        }
        return zipText;
      } catch (zipErr) {
        return `[Error unzipping ${filename}: ${zipErr.message}]`;
      }
    }

    // 2. PDF Parsing
    if (ext === "pdf" || file.type === "application/pdf") {
      try {
        const data = await pdfParse(buffer);
        return `[PDF Text Content: ${filename}]\n${data.text || "No text found in PDF"}`;
      } catch (pdfErr) {
        return `[Error parsing PDF ${filename}: ${pdfErr.message}]`;
      }
    }

    // 3. Word Document (.docx)
    if (
      ext === "docx" ||
      file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      try {
        const zip = new AdmZip(buffer);
        const docEntry = zip.getEntry("word/document.xml");
        if (docEntry) {
          const xml = docEntry.getData().toString("utf-8");
          const cleanText = xml
            .replace(/<\/w:p>/g, "\n")
            .replace(/<[^>]+>/g, "")
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">");
          return `[Word Document Text: ${filename}]\n${cleanText}`;
        }
        return `[Word Document: ${filename} - XML source word/document.xml not found]`;
      } catch (docxErr) {
        return `[Error parsing Word document ${filename}: ${docxErr.message}]`;
      }
    }

    // 4. Excel spreadsheet (.xlsx)
    if (
      ext === "xlsx" ||
      file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      try {
        const zip = new AdmZip(buffer);
        const sharedStringsEntry = zip.getEntry("xl/sharedStrings.xml");
        let strings = [];
        if (sharedStringsEntry) {
          const xml = sharedStringsEntry.getData().toString("utf-8");
          strings = xml.match(/<t[^>]*>(.*?)<\/t>/g) || [];
          strings = strings.map((s) => s.replace(/<[^>]+>/g, ""));
        }

        let xlsxText = `[Excel Spreadsheet Text: ${filename}]\n`;
        const sheetEntries = zip
          .getEntries()
          .filter((e) => e.entryName.startsWith("xl/worksheets/sheet"));
        for (const sheetEntry of sheetEntries) {
          const xml = sheetEntry.getData().toString("utf-8");
          const sheetName = sheetEntry.entryName.split("/").pop();
          xlsxText += `\n--- Worksheet: ${sheetName} ---\n`;

          const rows = xml.match(/<row[^>]*>(.*?)<\/row>/g) || [];
          for (const row of rows) {
            const cells = row.match(/<v>(.*?)<\/v>/g) || [];
            const rowValues = cells.map((cell) => {
              const val = cell.replace(/<[^>]+>/g, "");
              const isShared = row.includes('t="s"');
              if (isShared) {
                const idx = parseInt(val, 10);
                return strings[idx] || val;
              }
              return val;
            });
            if (rowValues.length > 0) {
              xlsxText += rowValues.join(" | ") + "\n";
            }
          }
        }
        return xlsxText;
      } catch (xlsxErr) {
        return `[Error parsing Excel document ${filename}: ${xlsxErr.message}]`;
      }
    }

    // 5. Binary file ASCII extractor for general/unknown binary files
    if (isBase64 && !file.isImage) {
      const strings = extractPrintableStrings(buffer);
      return `[Binary/Special File Extraction: ${filename}]\n[Extracted Strings]:\n${strings}`;
    }

    // 6. Plain Text / Code formats
    return buffer.toString("utf-8");
  } catch (err) {
    return `[Error reading/processing file ${file.name}: ${err.message}]`;
  }
};

// ─── Model Registry ────────────────────────────────────────────────────────────
const MODEL_REGISTRY = {
  // Pollinations AI Models (Keyless, Backend-Executed, 100% Free Forever)
  openai: {
    label: "GPT-4o-Mini (Free)",
    provider: "OpenAI",
    contextWindow: 128000,
    strengths: ["general", "math", "fast"],
    badge: "🔥",
  },
  claude: {
    label: "Claude 3.5 Sonnet (Free)",
    provider: "Anthropic",
    contextWindow: 200000,
    strengths: ["reasoning", "coding", "analysis"],
    badge: "🧬",
  },
  deepseek: {
    label: "DeepSeek V3 (Free)",
    provider: "DeepSeek",
    contextWindow: 64000,
    strengths: ["reasoning", "code", "logic"],
    badge: "🧠",
  },
  llama: {
    label: "Llama 3.1 405B (Free)",
    provider: "Meta",
    contextWindow: 128000,
    strengths: ["fast", "creative", "general"],
    badge: "🛸",
  },
  qwen: {
    label: "Qwen 2.5 72B (Free)",
    provider: "Alibaba",
    contextWindow: 32000,
    strengths: ["coding", "structured-output", "speed"],
    badge: "🔴",
  },
  "qwen-coder": {
    label: "Qwen Coder 32B (Free)",
    provider: "Alibaba",
    contextWindow: 32000,
    strengths: ["coding", "agents"],
    badge: "💻",
  },
  mistral: {
    label: "Mistral Nemo (Free)",
    provider: "Mistral AI",
    contextWindow: 32000,
    strengths: ["fast", "general"],
    badge: "🌪️",
  },
  searchgpt: {
    label: "SearchGPT (Free)",
    provider: "Google/Bing",
    contextWindow: 32000,
    strengths: ["web-search", "citations"],
    badge: "🔍",
  },
};

const DEFAULT_MODEL = "openai";

// ─── Helper: Build enriched system prompt ──────────────────────────────────────
const buildEnrichedSystemPrompt = (
  systemStats,
  modelId,
  memories = [],
  promptTemplate = SYSTEM_PROMPT,
) => {
  const modelInfo = MODEL_REGISTRY[modelId] || {};
  const memoryText = memories
    .map((m) => `- [${m.category}] ${m.text}`)
    .join("\n");

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

// ─── Helper: Trim message history to prevent context overflow ───────────────────
const trimMessageHistory = (messages, maxTokens = 4096) => {
  const maxChars = maxTokens * 4;
  let totalChars = 0;
  const trimmed = [];

  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    const len = (msg.content || "").length;
    if (totalChars + len > maxChars) {
      console.log(`[copilot-trim] Pruning history: reached token limit at message index ${i}`);
      break;
    }
    totalChars += len;
    trimmed.unshift(msg);
  }
  return trimmed;
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

    return trimMessageHistory(messages, 4000);
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
        (queryLower.includes("deployment") &&
          sectionLower.includes("compendium")) ||
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
        0,
      );
      stats.highCount = scans.reduce((acc, s) => acc + (s.highCount || 0), 0);
    }
  } catch (err) {
    console.warn("[copilot] DB stats failed:", err.message);
  }
  return stats;
};

const callOpenRouter = async (
  messages,
  systemPrompt,
  model,
  temperature,
  trainingPairs = [],
) => {
  if (!config.openRouterApiKey) {
    throw new Error("OpenRouter API Key not configured");
  }

  const modelId = config.openRouterModel || "meta-llama/llama-3.1-8b-instruct:free";
  const temp = Math.min(Math.max(parseFloat(temperature) || 0.7, 0.1), 1.5);

  const formattedTraining = [];
  for (const pair of trainingPairs) {
    formattedTraining.push({
      role: "user",
      content: `Example input: ${pair.prompt}`,
    });
    formattedTraining.push({
      role: "assistant",
      content: `Expected output: ${pair.response}`,
    });
  }

  const fullMessages = [
    { role: "system", content: systemPrompt },
    ...formattedTraining,
    ...messages,
  ];

  console.log(`[copilot] Querying OpenRouter model "${modelId}"...`);
  const response = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model: modelId,
      messages: fullMessages,
      temperature: temp,
    },
    {
      headers: {
        Authorization: `Bearer ${config.openRouterApiKey}`,
        "Content-Type": "application/json",
      },
      timeout: 30000,
    }
  );

  if (response.data?.choices?.[0]?.message?.content) {
    return { content: response.data.choices[0].message.content, model: `openrouter:${modelId}` };
  }

  throw new Error("Empty response from OpenRouter");
};

const callOpenRouterStream = async (
  messages,
  systemPrompt,
  model,
  temperature,
  trainingPairs = [],
  onToken,
) => {
  if (!config.openRouterApiKey) {
    throw new Error("OpenRouter API Key not configured");
  }

  const modelId = config.openRouterModel || "meta-llama/llama-3.1-8b-instruct:free";
  const temp = Math.min(Math.max(parseFloat(temperature) || 0.7, 0.1), 1.5);

  const formattedTraining = [];
  for (const pair of trainingPairs) {
    formattedTraining.push({
      role: "user",
      content: `Example input: ${pair.prompt}`,
    });
    formattedTraining.push({
      role: "assistant",
      content: `Expected output: ${pair.response}`,
    });
  }

  const fullMessages = [
    { role: "system", content: systemPrompt },
    ...formattedTraining,
    ...messages,
  ];

  console.log(`[copilot] Querying OpenRouter stream model "${modelId}"...`);
  const response = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model: modelId,
      messages: fullMessages,
      temperature: temp,
      stream: true,
    },
    {
      headers: {
        Authorization: `Bearer ${config.openRouterApiKey}`,
        "Content-Type": "application/json",
      },
      responseType: "stream",
      timeout: 30000,
    }
  );

  return new Promise((resolve, reject) => {
    let accumulatedText = "";
    let buffer = "";

    response.data.on("data", (chunk) => {
      buffer += chunk.toString();
      let lines = buffer.split("\n");
      buffer = lines.pop();

      for (const line of lines) {
        const cleaned = line.trim();
        if (!cleaned) continue;
        if (cleaned.startsWith("data:")) {
          const raw = cleaned.slice(5).trim();
          if (raw === "[DONE]") continue;
          try {
            const parsed = JSON.parse(raw);
            const content = parsed.choices?.[0]?.delta?.content || "";
            if (content) {
              accumulatedText += content;
              if (onToken) onToken(content);
            }
          } catch (e) {}
        }
      }
    });

    response.data.on("end", () => {
      if (buffer.trim()) {
        const line = buffer.trim();
        let raw = line;
        if (line.startsWith("data:")) {
          raw = line.slice(5).trim();
        }
        if (raw !== "[DONE]" && raw.startsWith("{") && raw.endsWith("}")) {
          try {
            const parsed = JSON.parse(raw);
            const content = parsed.choices?.[0]?.delta?.content || "";
            if (content) {
              accumulatedText += content;
              if (onToken) onToken(content);
            }
          } catch (e) {}
        }
      }
      resolve({ content: accumulatedText, model: `openrouter:${modelId}` });
    });

    response.data.on("error", (err) => {
      reject(err);
    });
  });
};

const callPollinations = async (
  messages,
  systemPrompt,
  model,
  temperature,
  trainingPairs = [],
) => {
  let modelId = model || DEFAULT_MODEL;
  if (modelId === "claude") {
    modelId = "openai";
  }
  const temp = Math.min(Math.max(parseFloat(temperature) || 0.7, 0.1), 1.5);

  const formattedTraining = [];
  for (const pair of trainingPairs) {
    formattedTraining.push({
      role: "user",
      content: `Example input: ${pair.prompt}`,
    });
    formattedTraining.push({
      role: "assistant",
      content: `Expected output: ${pair.response}`,
    });
  }

  const fullMessages = [
    { role: "system", content: systemPrompt },
    ...formattedTraining,
    ...messages,
  ];

  console.log(`[copilot] Querying Pollinations model "${modelId}"...`);
  const response = await axios.post(
    "https://text.pollinations.ai/",
    {
      messages: fullMessages,
      model: modelId,
      temperature: temp,
    },
    {
      timeout: 90000, // 90 seconds timeout
    },
  );

  // Pollinations returns the plain text string directly in response.data when jsonMode is not set
  if (typeof response.data === "string" && response.data.trim().length > 0) {
    return { content: response.data, model: modelId };
  } else if (response.data && typeof response.data === "object") {
    const content =
      response.data.response || response.data.choices?.[0]?.message?.content;
    if (content) return { content, model: modelId };
  }

  throw new Error("Empty or invalid response from Pollinations model");
};

const callPollinationsStream = async (
  messages,
  systemPrompt,
  model,
  temperature,
  trainingPairs = [],
  onToken,
) => {
  let modelId = model || DEFAULT_MODEL;
  if (modelId === "claude") {
    modelId = "openai";
  }
  const temp = Math.min(Math.max(parseFloat(temperature) || 0.7, 0.1), 1.5);

  const formattedTraining = [];
  for (const pair of trainingPairs) {
    formattedTraining.push({
      role: "user",
      content: `Example input: ${pair.prompt}`,
    });
    formattedTraining.push({
      role: "assistant",
      content: `Expected output: ${pair.response}`,
    });
  }

  const fullMessages = [
    { role: "system", content: systemPrompt },
    ...formattedTraining,
    ...messages,
  ];

  console.log(
    `[copilot] Querying Pollinations model "${modelId}" in streaming mode...`,
  );
  const response = await axios.post(
    "https://text.pollinations.ai/",
    {
      messages: fullMessages,
      model: modelId,
      temperature: temp,
      stream: true,
    },
    {
      responseType: "stream",
      timeout: 90000,
    },
  );

  return new Promise((resolve, reject) => {
    let accumulatedText = "";
    let buffer = "";

    response.data.on("data", (chunk) => {
      buffer += chunk.toString();
      let lineIndex;
      while ((lineIndex = buffer.indexOf("\n")) !== -1) {
        const line = buffer.slice(0, lineIndex).trim();
        buffer = buffer.slice(lineIndex + 1);

        if (!line) continue;

        let raw = line;
        if (line.startsWith("data:")) {
          raw = line.slice(5).trim();
        }

        if (raw === "[DONE]") continue;

        let content = "";
        if (raw.startsWith("{") && raw.endsWith("}")) {
          try {
            const parsed = JSON.parse(raw);
            content =
              parsed.choices?.[0]?.delta?.content || parsed.response || "";
          } catch (e) {
            // treat as raw or ignore
          }
        }

        if (content) {
          accumulatedText += content;
          if (onToken) onToken(content);
        }
      }
    });

    response.data.on("end", () => {
      if (buffer.trim()) {
        const line = buffer.trim();
        let raw = line;
        if (line.startsWith("data:")) {
          raw = line.slice(5).trim();
        }
        if (raw !== "[DONE]" && raw.startsWith("{") && raw.endsWith("}")) {
          try {
            const parsed = JSON.parse(raw);
            const content =
              parsed.choices?.[0]?.delta?.content || parsed.response || "";
            if (content) {
              accumulatedText += content;
              if (onToken) onToken(content);
            }
          } catch (e) {}
        }
      }
      resolve({ content: accumulatedText, model: modelId });
    });

    response.data.on("error", (err) => {
      reject(err);
    });
  });
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
    return (
      intro +
      `#### 🚨 SQL Injection (CWE-89) Analysis

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
| ORM Usage | 🟢 RECOMMENDED | Use Mongoose/Sequelize/Prisma |`
    );
  }

  if (q.includes("jwt") || q.includes("token") || q.includes("auth")) {
    return (
      intro +
      `#### 🔐 JWT Authentication Security Analysis

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
| Token blacklisting on logout | 🔴 IMPLEMENT | Redis blocklist |`
    );
  }

  if (
    q.includes("scan") ||
    q.includes("vulnerability") ||
    q.includes("finding")
  ) {
    return (
      intro +
      `#### 🛡️ Workspace Security Status Report

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
\`\`\``
    );
  }

  // Default high-quality general response
  return (
    intro +
    `#### 🧠 Security Architecture Analysis

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

Ask me anything more specific about your \`${topTarget}\` setup!`
  );
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
    return res
      .status(201)
      .json({ success: true, conversation: newConversation });
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
      return res
        .status(404)
        .json({ success: false, message: "Conversation not found" });
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
      return res
        .status(404)
        .json({ success: false, message: "Conversation not found" });
    }

    const copy = new CopilotConversation({
      userId,
      title: `${original.title} (Copy)`,
      isPinned: false,
      isArchived: false,
    });
    await copy.save();

    const originalMessages = await CopilotMessage.find({
      conversationId: id,
    }).sort({ createdAt: 1 });
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
      return res
        .status(400)
        .json({ success: false, message: "Invalid conversation ID" });
    }

    const conversation = await CopilotConversation.findOneAndDelete({
      _id: id,
      userId,
    });
    if (!conversation) {
      return res
        .status(404)
        .json({ success: false, message: "Conversation not found" });
    }

    // Cascade delete all messages
    await CopilotMessage.deleteMany({ conversationId: id });

    return res.json({
      success: true,
      message: "Conversation deleted successfully",
    });
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
      { new: true },
    );
    if (!conv) {
      return res
        .status(404)
        .json({ success: false, message: "Conversation not found" });
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
      return res
        .status(404)
        .json({ success: false, message: "Conversation not found" });
    }

    const messages = await CopilotMessage.find({ conversationId: id }).sort({
      createdAt: 1,
    });
    return res.json({ success: true, messages });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const learnMemoryFromConversation = async (
  userId,
  teamId,
  userQuery,
  aiReplyText,
) => {
  try {
    const summaryPrompt = `You are a background AI context extractor.
Review the conversation snippet below between a developer (user) and a security copilot.
Extract any new, specific architectural parameters, staging API URLs, custom authentication tokens/keys, local testing hosts, database settings, or custom scanning rules discussed.
Convert them into short, clear, third-person declarative statements (max 20 words each) suitable to be saved as long-term AI memory notes.

Example output format:
- Staging server runs on http://127.0.0.1:4000/api.
- Custom authentication utilizes the 'X-API-KEY' header.

Respond ONLY with the list of statements (starting with '-'). If no new concrete facts or configurations are discussed, respond with 'NONE'.

Conversation:
User: ${userQuery}
Assistant: ${aiReplyText}`;

    console.log(
      "[copilot-learning] Triggering background conversation fact extraction...",
    );
    const result = await callPollinations(
      [{ role: "user", content: "Extract architectural facts." }],
      summaryPrompt,
      "openai", // use standard openai fallback on pollinations
      0.2, // low temperature for precise extraction
      [],
    );

    const reply = result.content || "";
    if (reply.toUpperCase().includes("NONE") || reply.trim().length < 5) {
      console.log(
        "[copilot-learning] No new architectural facts detected. Skipping memory save.",
      );
      return;
    }

    const lines = reply.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
        const text = trimmed.replace(/^[-*]\s+/, "").trim();
        if (text.length > 10) {
          // Check if memory already exists
          const query = teamId ? { teamId, text } : { userId, text };
          const existing = await CopilotMemory.findOne(query);
          if (!existing) {
            // Classify category based on keywords
            let category = "General";
            const lowerText = text.toLowerCase();
            if (
              lowerText.includes("auth") ||
              lowerText.includes("token") ||
              lowerText.includes("jwt") ||
              lowerText.includes("key") ||
              lowerText.includes("cookie")
            ) {
              category = "Authentication";
            } else if (
              lowerText.includes("port") ||
              lowerText.includes("ip") ||
              lowerText.includes("url") ||
              lowerText.includes("server") ||
              lowerText.includes("host") ||
              lowerText.includes("mongodb") ||
              lowerText.includes("docker")
            ) {
              category = "Infrastructure";
            } else if (
              lowerText.includes("scan") ||
              lowerText.includes("vulnerability") ||
              lowerText.includes("cors") ||
              lowerText.includes("risk") ||
              lowerText.includes("attack")
            ) {
              category = "Security";
            }

            const newMemory = new CopilotMemory({
              userId,
              teamId: teamId || undefined,
              text,
              category,
            });
            await newMemory.save();
            console.log(
              `[copilot-learning] Auto-learned and saved new memory: [${category}] ${text}`,
            );
          }
        }
      }
    }
  } catch (err) {
    console.error(
      "[copilot-learning] Background auto-learning error:",
      err.message,
    );
  }
};

// POST /api/copilot/conversations/:id/messages — Main AI Brain
const handleChatRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, model, temperature, webSearch, attachments } = req.body;
    const userId = req.user.id;
    const userQuery = (message || "").trim();

    if (!userQuery && (!attachments || attachments.length === 0)) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Message or attachment is required.",
        });
    }

    // Validate input query with Guardrails
    if (userQuery) {
      const inputCheck = llmGuardrails.validateInput(userQuery);
      if (!inputCheck.safe) {
        return res.status(400).json({
          success: false,
          message: inputCheck.reason,
        });
      }
    }

    // 1. Verify conversation ownership
    const conversation = await CopilotConversation.findOne({ _id: id, userId });
    if (!conversation) {
      return res
        .status(404)
        .json({ success: false, message: "Conversation not found." });
    }

    // 2. Save user message
    const userMsg = new CopilotMessage({
      conversationId: id,
      sender: "user",
      text:
        userQuery ||
        (attachments && attachments.length > 0
          ? `[Attached ${attachments.length} file(s)]`
          : ""),
      timestamp: new Date(),
      metadata: {
        attachments: (attachments || []).map((att) => ({
          name: att.name,
          type: att.type,
          size: att.size,
          isImage: att.isImage || false,
        })),
      },
    });
    await userMsg.save();

    // 3. Auto-update conversation title on first message
    if (
      conversation.title === "New Chat" ||
      conversation.title === "New Chat Session" ||
      conversation.title === "New Conversation"
    ) {
      conversation.title =
        userQuery.length > 40 ? userQuery.slice(0, 40) + "..." : userQuery;
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
    const promptTemplate =
      userSettings?.customSystemPrompt?.trim() || SYSTEM_PROMPT;

    // 4d. Query security prompt knowledge base dynamically (RAG)
    const kbPromptContext = queryKnowledgeBase(userQuery);

    // Perform dynamic Web Search if requested by client OR if query contains search indicators
    let webContext = "";
    let searchResults = [];
    const shouldSearch =
      webSearch === true ||
      /search|web|lookup|find|explain|who is|what is|tell me about|how to/i.test(
        userQuery,
      );
    if (shouldSearch) {
      try {
        searchResults = await searchWeb(userQuery);
        if (searchResults && searchResults.length > 0) {
          webContext = `
================================================================================
## LIVE GOOGLE SEARCH RESULTS
Total results retrieved: ${searchResults.length}

${searchResults
  .map(
    (res, i) => `[${i + 1}] ${res.title}
   URL: ${res.url}
   Excerpt: ${res.snippet}`,
  )
  .join("\n\n")}

================================================================================
## MANDATORY CITATION & REFINE RULES
1. Rely ONLY on the search results that are directly related and helpful to the query.
2. Read the search excerpts, extract the precise relevant information, and refine it into a high-tech, highly relevant security analysis.
3. Only include citation links for sources you ACTUALLY used to retrieve the information. Do NOT dump general links or unused sources.
4. Format inline citations as "[Source Name](URL)".
5. At the very end of your response, create a "## 🔗 References" section listing ONLY the sources you actually used, using their real, unaltered URLs from the results above.
================================================================================
`;
        }
      } catch (searchErr) {
        console.warn("[copilot] Web search helper failed:", searchErr.message);
      }
    }

    // Build file context if attachments are present
    let fileContext = "";
    if (attachments && attachments.length > 0) {
      fileContext +=
        "\n\n================================================================================\n## ATTACHED WORKSPACE FILES\n";
      const fileContexts = await Promise.all(
        attachments.map(async (file) => {
          if (file.isImage) {
            return `\n--- File: ${file.name} (Image Thumbnail Attached) ---\n[Image Data URL Base64: ${file.name}]\n`;
          } else {
            const parsedText = await parseAttachment(file);
            return `\n--- File: ${file.name} (${(file.size / 1024).toFixed(1)} KB) ---\n${parsedText}\n`;
          }
        }),
      );
      fileContext += fileContexts.join("\n");
      fileContext +=
        "\n================================================================================\n";
    }

    // 4e. Perform Enterprise RAG Retrieval
    let ragContext = "";
    try {
      const ragPipeline = require("../llm/rag/rag.pipeline");
      ragContext = await ragPipeline.retrieveContext(userQuery, 3);
    } catch (ragErr) {
      console.warn("[copilot-rag] Retrieval failed:", ragErr.message);
    }

    // 4f. Perform Long-term Memory Retrieval
    let memoryContext = "";
    try {
      const memoryService = require("./memory.service");
      const memories = await memoryService.retrieveMemories(userId, userQuery, 3);
      if (memories.length > 0) {
        memoryContext = `\n\n================================================================================
## USER PREFERENCES & HISTORICAL CONTEXT (Stored Memories)
${memories.map((m) => `- ${m.content}`).join("\n")}
================================================================================\n`;
      }
    } catch (memErr) {
      console.warn("[copilot-memory] Retrieval failed:", memErr.message);
    }

    const combinedPrompt =
      promptTemplate + kbPromptContext + webContext + fileContext + ragContext + memoryContext;

    // 5. Build message history
    let selectedModel = model;
    let fallbackModels = [];
    if (!model || model === DEFAULT_MODEL) {
      const routed = llmRouter.route(userQuery);
      selectedModel = routed.provider;
      fallbackModels = routed.preferences;
    } else {
      fallbackModels = llmRegistry.getFallbackChain();
    }
    const uniqueModels = Array.from(new Set([selectedModel, ...fallbackModels]));
    const messageHistory = await buildMessageHistory(id, userQuery, 12);

    // 6. Build enriched system prompt
    const enrichedSystemPrompt = buildEnrichedSystemPrompt(
      systemStats,
      selectedModel,
      userMemories,
      combinedPrompt,
    );

    const isStream = req.body.stream === true;
    const requestTeamId = req.headers["x-team-id"];

    if (isStream) {
      // 1. Immediately return success status to client
      res.json({
        success: true,
        stream: true,
        conversationId: id,
        model: selectedModel,
      });

      // 2. Process streaming in the background
      (async () => {
        try {
          const aiEmitter = require("../../sockets/emitters/ai.emitter");
          aiEmitter.emitAiThinking(userId, { conversationId: id });
          aiEmitter.emitAiStreamStart(userId, { conversationId: id });

          let finalReply = "";
          let finalModel = selectedModel;

          for (const currentTryModel of uniqueModels) {
            try {
              console.log(`[copilot-stream] Querying model adapter for ${currentTryModel}`);
              const adapter = llmRegistry.getAdapter(currentTryModel);
              const result = await adapter.stream(
                messageHistory,
                (token) => {
                  finalReply += token;
                  aiEmitter.emitAiStream(userId, {
                    conversationId: id,
                    text: token,
                  });
                },
                {
                  model: currentTryModel,
                  temperature: temperature || 0.7,
                }
              );
              finalModel = result.model || currentTryModel;
              break;
            } catch (apiErr) {
              console.warn(
                `[copilot-stream] Model adapter ${currentTryModel} stream failed:`,
                apiErr.message,
              );
            }
          }

          if (!finalReply) {
            finalReply = generateContextualFallback(userQuery, systemStats);
            finalModel = "local-fallback";
            aiEmitter.emitAiStream(userId, {
              conversationId: id,
              text: finalReply,
            });
          }

          // Save AI reply to DB
          finalReply = llmGuardrails.sanitizeOutput(finalReply);
          const assistantMsg = new CopilotMessage({
            conversationId: id,
            sender: "assistant",
            text: finalReply,
            timestamp: new Date(),
            metadata: {
              model: finalModel,
              searchResults: searchResults || [],
            },
          });
          await assistantMsg.save();

          // Auto-learn memory from stream
          learnMemoryFromConversation(
            userId,
            requestTeamId,
            userQuery,
            finalReply,
          ).catch((learnErr) =>
            console.error(
              "[copilot-learning] Stream memory extraction error:",
              learnErr.message,
            ),
          );

          // Emit end event
          aiEmitter.emitAiStreamEnd(userId, {
            conversationId: id,
            text: finalReply,
            model: finalModel,
            searchResults: searchResults || [],
          });
        } catch (streamErr) {
          console.error("[copilot-stream] Stream loop crash:", streamErr);
        }
      })();
      return;
    }

    let aiReplyText = "";
    let usedModel = selectedModel;
    let error = null;

    let attempts = 0;
    const funnelMode = process.env.FUNNEL_MODE || "single"; // parallel | consensus | debate | single

    if (funnelMode === "parallel") {
      try {
        const result = await require("../llm/router/llm.funnel").executeFunnel(
          uniqueModels.slice(0, 2),
          messageHistory,
          { temperature: temperature || 0.7 }
        );
        aiReplyText = result.content;
        usedModel = result.model;
      } catch (err) {
        console.warn("[copilot-funnel] Parallel execution failed, falling back to sequential:", err.message);
      }
    } else if (funnelMode === "consensus") {
      try {
        const result = await require("../llm/consensus/consensus.engine").runConsensus(
          messageHistory,
          { temperature: temperature || 0.7 }
        );
        aiReplyText = result.content;
        usedModel = result.model;
      } catch (err) {
        console.warn("[copilot-consensus] Consensus evaluation failed, falling back to sequential:", err.message);
      }
    } else if (funnelMode === "debate" || (userQuery && userQuery.toLowerCase().includes("/debate"))) {
      try {
        const result = await require("../llm/consensus/consensus.engine").runDebate(
          userQuery,
          { temperature: temperature || 0.7 }
        );
        aiReplyText = result.content;
        usedModel = result.model;
      } catch (err) {
        console.warn("[copilot-debate] AI Debate failed, falling back to sequential:", err.message);
      }
    }

    if (!aiReplyText) {
      for (const currentTryModel of uniqueModels) {
        attempts++;
        try {
          console.log(
            `[copilot] Attempt ${attempts}: trying model adapter ${currentTryModel}`,
          );
          const adapter = llmRegistry.getAdapter(currentTryModel);
          const result = await adapter.generate(
            messageHistory,
            {
              model: currentTryModel,
              temperature: temperature || 0.7,
            }
          );
          aiReplyText = result.content;
          usedModel = result.model || currentTryModel;
          error = null;
          if (currentTryModel !== selectedModel) {
            console.log(
              `[copilot] Note: Responded via fallback adapter ${currentTryModel} (selected: ${selectedModel})`,
            );
          }
          break;
        } catch (apiErr) {
          error = apiErr.message;
          console.warn(
            `[copilot] Model adapter ${currentTryModel} failed:`,
            error?.slice(0, 100),
          );
        }
      }
    }

    // 9. Use local intelligent fallback if AI failed
    if (!aiReplyText) {
      aiReplyText = generateContextualFallback(userQuery, systemStats);
      if (error) {
        aiReplyText = `> [!WARNING]\n> **AI Engine Offline** — ${error}\n> Displaying intelligent local analysis.\n\n${aiReplyText}`;
      }
      usedModel = "local-fallback";
    }

    // 9. Save AI reply
    aiReplyText = llmGuardrails.sanitizeOutput(aiReplyText);
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

    // Trigger background self-learning fact extraction
    learnMemoryFromConversation(
      userId,
      requestTeamId,
      userQuery,
      aiReplyText,
    ).catch((learnErr) =>
      console.error("[copilot-learning] Extraction error:", learnErr.message),
    );

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

const saveAssistantMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { reply, model, searchResults } = req.body;
    const userId = req.user.id;

    const conversation = await CopilotConversation.findOne({ _id: id, userId });
    if (!conversation) {
      return res
        .status(404)
        .json({ success: false, message: "Conversation not found." });
    }

    const assistantMsg = new CopilotMessage({
      conversationId: id,
      sender: "assistant",
      text: reply,
      timestamp: new Date(),
      metadata: {
        model: model || "claude-sonnet-5",
        searchResults: searchResults || [],
      },
    });
    await assistantMsg.save();

    conversation.updatedAt = new Date();
    await conversation.save();

    return res.json({ success: true });
  } catch (error) {
    console.error("[copilot] saveAssistantMessage error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getMemories = async (req, res) => {
  try {
    const userId = req.user?._id;
    const teamId = req.headers["x-team-id"];
    const query = teamId ? { teamId } : { userId };

    let memories = await CopilotMemory.find(query).sort({ createdAt: -1 });

    // Auto-seed default memories if database is empty to make it immediately working out of the box!
    if (memories.length === 0) {
      const defaultMemories = [
        {
          userId,
          teamId: teamId || undefined,
          text: "Staging API endpoints reside on http://127.0.0.1:5000/api and require custom 'Authorization: Bearer DevToken999' authentication headers.",
          category: "Security",
        },
        {
          userId,
          teamId: teamId || undefined,
          text: "The backend storage runs containerized MongoDB instances using Mongoose ODM schemas to sanitize payload properties.",
          category: "Infrastructure",
        },
        {
          userId,
          teamId: teamId || undefined,
          text: "User session access tokens expire in 15 minutes, refreshing dynamically via secure HTTP-Only authorization cookies.",
          category: "Authentication",
        },
      ];
      await CopilotMemory.insertMany(defaultMemories);
      memories = await CopilotMemory.find(query).sort({ createdAt: -1 });
    }

    return res.json({ success: true, memories });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const createMemory = async (req, res) => {
  try {
    const userId = req.user?._id;
    const teamId = req.headers["x-team-id"];
    const { text, category } = req.body;
    if (!text?.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Memory text is required" });
    }
    const newMemory = new CopilotMemory({
      userId,
      teamId: teamId || undefined,
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
    const teamId = req.headers["x-team-id"];
    const query = teamId ? { teamId } : { userId };

    let trainings = await CopilotTrainingPair.find(query).sort({
      createdAt: -1,
    });

    // Auto-seed default training pairs if empty to make it instantly working!
    if (trainings.length === 0) {
      const defaultTrainings = [
        {
          userId,
          teamId: teamId || undefined,
          prompt:
            "How should I handle SQL injection vulnerabilities inside user search parameters?",
          response:
            "Always implement Mongoose parameterized queries or schema casting validations. Never construct queries using string concatenation: e.g. use User.find({ name }) instead of raw MongoDB Javascript $where clauses.",
        },
        {
          userId,
          teamId: teamId || undefined,
          prompt:
            "What is the security risk of configuring Access-Control-Allow-Origin: *?",
          response:
            "Rating: HIGH. Wildcard origins enable cross-origin scripts to read protected API responses. Restrict origins dynamically to trusted subdomains or verified whitelist configurations.",
        },
      ];
      await CopilotTrainingPair.insertMany(defaultTrainings);
      trainings = await CopilotTrainingPair.find(query).sort({ createdAt: -1 });
    }

    return res.json({ success: true, trainings });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const createTraining = async (req, res) => {
  try {
    const userId = req.user?._id;
    const teamId = req.headers["x-team-id"];
    const { prompt, response } = req.body;
    if (!prompt?.trim() || !response?.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Prompt and response are required" });
    }
    const newPair = new CopilotTrainingPair({
      userId,
      teamId: teamId || undefined,
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

const submitFeedback = async (req, res) => {
  const { messageId, correctness, reason } = req.body;
  if (!messageId || !correctness) {
    return res.status(400).json({ success: false, message: "messageId and correctness are required." });
  }

  try {
    const { confidenceEngine } = require("../llm/consensus/confidence.engine");
    await confidenceEngine.recordFeedback(messageId, correctness, reason);

    const { CopilotMessage } = require("./copilot.model");
    const msg = await CopilotMessage.findById(messageId);
    if (msg && msg.metadata) {
      const model = msg.metadata.model || "openai";
      const category = msg.metadata.category || "general";
      
      const selfLearning = require("../llm/router/llm.selflearning");
      selfLearning.logFeedback(model, category, correctness === "correct");
    }

    return res.json({ success: true, message: "Feedback recorded successfully." });
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
  saveAssistantMessage,
  getMemories,
  createMemory,
  deleteMemory,
  getTrainings,
  createTraining,
  deleteTraining,
  submitFeedback,
};
