const dotenv = require("dotenv");
const { z } = require("zod");

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.preprocess((val) => val === undefined ? undefined : Number(val), z.number().default(5000)),
  MONGODB_URI: z.string({ required_error: "MONGODB_URI is required" }),
  JWT_ACCESS_SECRET: z.string({ required_error: "JWT_ACCESS_SECRET is required" }),
  JWT_REFRESH_SECRET: z.string({ required_error: "JWT_REFRESH_SECRET is required" }),
  CLIENT_URL: z.string({ required_error: "CLIENT_URL is required" }),
  OPENROUTER_API_KEY: z.string().optional(),
  OPENROUTER_MODEL: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),
  DEEPSEEK_API_KEY: z.string().optional(),
  TOGETHER_API_KEY: z.string().optional(),
  MISTRAL_API_KEY: z.string().optional(),
  COHERE_API_KEY: z.string().optional(),
  OLLAMA_HOST_URL: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Environment validation failed:");
  console.error(JSON.stringify(parsed.error.format(), null, 2));
  process.exit(1);
}

const validated = parsed.data;

/**
 * Anti-leak security helper: Sanitizes objects by masking sensitive keys
 */
const sanitizeSecrets = (data) => {
  if (!data || typeof data !== "object") return data;
  const sensitiveKeys = ["key", "secret", "token", "auth", "password", "apiKey", "jwt"];
  const sanitized = Array.isArray(data) ? [] : {};
  
  for (const [k, v] of Object.entries(data)) {
    const isSensitive = sensitiveKeys.some((sk) => k.toLowerCase().includes(sk.toLowerCase()));
    if (isSensitive && typeof v === "string" && v.length > 4) {
      sanitized[k] = `${v.slice(0, 3)}...***...${v.slice(-3)}`;
    } else if (typeof v === "object" && v !== null) {
      sanitized[k] = sanitizeSecrets(v);
    } else {
      sanitized[k] = v;
    }
  }
  return sanitized;
};

module.exports = {
  nodeEnv: validated.NODE_ENV,
  port: validated.PORT,
  mongoUri: validated.MONGODB_URI,
  jwtAccessSecret: validated.JWT_ACCESS_SECRET,
  jwtRefreshSecret: validated.JWT_REFRESH_SECRET,
  clientUrl: validated.CLIENT_URL,
  openRouterApiKey: validated.OPENROUTER_API_KEY,
  openRouterModel: validated.OPENROUTER_MODEL,
  openaiApiKey: validated.OPENAI_API_KEY,
  anthropicApiKey: validated.ANTHROPIC_API_KEY,
  geminiApiKey: validated.GEMINI_API_KEY,
  groqApiKey: validated.GROQ_API_KEY,
  deepseekApiKey: validated.DEEPSEEK_API_KEY,
  togetherApiKey: validated.TOGETHER_API_KEY,
  mistralApiKey: validated.MISTRAL_API_KEY,
  cohereApiKey: validated.COHERE_API_KEY,
  ollamaHostUrl: validated.OLLAMA_HOST_URL,
  sanitizeSecrets,
};
