const axios = require("axios");

const config = require("../../config/env");

const SECURITY_PROMPT = require("../../prompts/security-analysis.prompt");

const OUTPUT_SCHEMA = require("./output.schema");

const analyzeWithAI = async (vulnerability) => {
  const response = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model: "nvidia/nemotron-3-ultra-550b-a55b:free",

      messages: [
        {
          role: "system",
          content: SECURITY_PROMPT,
        },

        {
          role: "system",
          content: OUTPUT_SCHEMA,
        },

        {
          role: "user",
          content: `
Analyze the following security finding.

Generate a professional security intelligence report.

Use markdown formatting where appropriate.

Use:
- headings
- subheadings
- nested bullet points
- numbered steps
- tables
- supporting details

Use diagrams only when useful.

Finding:

${JSON.stringify(vulnerability, null, 2)}
`,
        },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${config.openRouterApiKey}`,

        "Content-Type": "application/json",
      },
    },
  );

  return response.data.choices[0].message.content;
};

module.exports = {
  analyzeWithAI,
};
