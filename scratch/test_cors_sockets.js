const { isOriginAllowed } = require("../backend/src/config/cors.util");

console.log("=== Testing CORS Utility ===");
const testCases = [
  { url: "http://localhost:5173", expected: true },
  { url: "http://localhost:5173/", expected: true },
  { url: "HTTP://LOCALHOST:5173", expected: true },
  { url: "http://localhost:5173/path", expected: false },
  { url: "http://attacker.com", expected: false }
];

let allPassed = true;
for (const tc of testCases) {
  const result = isOriginAllowed(tc.url);
  console.log(`isOriginAllowed('${tc.url}') => ${result} (Expected: ${tc.expected})`);
  if (result !== tc.expected) {
    console.error(`❌ Test failed for: ${tc.url}`);
    allPassed = false;
  }
}

if (allPassed) {
  console.log("✅ All CORS utility tests passed successfully!");
} else {
  process.exit(1);
}
