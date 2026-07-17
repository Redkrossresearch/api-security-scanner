const BaseAdapter = require("../base.adapter");
const PollinationsAdapter = require("./pollinations.adapter");

class MockAdapter extends BaseAdapter {
  constructor() {
    super("mock", "mock-gpt-4");
    this.pollinations = new PollinationsAdapter();
  }

  async generate(messages, options = {}) {
    return this.pollinations.generate(messages, options);
  }

  async stream(messages, onToken, options = {}) {
    return this.pollinations.stream(messages, onToken, options);
  }

  async embed(text, options = {}) {
    const model = options.model || "mock-embed-1";
    return this.executeResilient(async () => {
      return {
        embedding: Array.from({ length: 1536 }, () => Math.random()),
        usage: {
          totalTokens: text.split(" ").length
        }
      };
    }, model);
  }

  async vision(imageBuffer, messages, options = {}) {
    const model = options.model || "mock-vision-1";
    return this.executeResilient(async () => {
      return {
        content: "Mock image description: This is a placeholder visual scan analysis.",
        usage: {
          promptTokens: 50,
          completionTokens: 30,
          totalTokens: 80
        }
      };
    }, model);
  }

  async toolCalling(messages, tools, options = {}) {
    const model = options.model || this.defaultModel;
    return this.executeResilient(async () => {
      return {
        toolCalls: [
          {
            id: "call_mock_1",
            type: "function",
            function: {
              name: "fetch_scan_report",
              arguments: JSON.stringify({ scanId: "123" })
            }
          }
        ]
      };
    }, model);
  }
}

module.exports = MockAdapter;
