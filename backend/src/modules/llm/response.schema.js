/**
 * response.schema.js (Sprint 92 — Response Schema v2 Engine)
 * Parses LLM responses into typed blocks: { type: 'markdown'|'code'|'table'|'json'|'alert'|'card', content, meta }.
 */
class ResponseSchemaV2 {
  parseResponseToTypedBlocks(rawText) {
    if (!rawText || typeof rawText !== "string") {
      return [{ type: "markdown", content: "No output generated." }];
    }

    const blocks = [];
    
    // Check for code blocks
    const codeRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;

    while ((match = codeRegex.exec(rawText)) !== null) {
      // Text before code block
      const prevText = rawText.slice(lastIndex, match.index).trim();
      if (prevText) {
        blocks.push({ type: "markdown", content: prevText });
      }

      const lang = match[1] || "text";
      const codeContent = match[2].trim();

      if (lang === "json" || codeContent.startsWith("{") || codeContent.startsWith("[")) {
        blocks.push({ type: "json", content: codeContent, meta: { language: "json" } });
      } else {
        blocks.push({ type: "code", content: codeContent, meta: { language: lang } });
      }

      lastIndex = match.index + match[0].length;
    }

    // Remaining text after last code block
    const remainingText = rawText.slice(lastIndex).trim();
    if (remainingText) {
      if (remainingText.includes("|---|") || remainingText.includes("| :-")) {
        blocks.push({ type: "table", content: remainingText });
      } else if (remainingText.toLowerCase().includes("[!important]") || remainingText.toLowerCase().includes("[!warning]")) {
        blocks.push({ type: "alert", content: remainingText });
      } else {
        blocks.push({ type: "markdown", content: remainingText });
      }
    }

    return blocks.length > 0 ? blocks : [{ type: "markdown", content: rawText }];
  }
}

module.exports = new ResponseSchemaV2();
