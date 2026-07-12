/**
 * Generates WAF rules dynamically based on vulnerability type, endpoint, parameter, and exploit payload.
 * Supports active exploit blocking, file exposure prevention, header injection/stripping, and cookie hardening.
 */

// Helper to escape regex special characters for ModSecurity rules
const escapeModSecRegex = (str) => {
  if (!str) return "";
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// Helper to escape strings for Cloudflare WAF expression strings
const escapeCloudflareString = (str) => {
  if (!str) return "";
  return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
};

export const generateWafRules = (vulnerability) => {
  const { title, category, endpoint, vulnerableParameter, exploitPayload, cwe, severity } = vulnerability;
  
  // Extract path from endpoint
  let path = "/";
  try {
    if (endpoint) {
      // Handle fully qualified URLs or simple paths
      const urlObj = new URL(endpoint.startsWith("http") ? endpoint : `http://example.com${endpoint}`);
      path = urlObj.pathname;
    }
  } catch (e) {
    path = endpoint || "/";
  }

  const param = vulnerableParameter || "query";
  const rawPayload = exploitPayload || "";
  const categoryKey = (category || "").toUpperCase();
  const titleKey = (title || "").toUpperCase();
  const cweKey = (cwe || "").toUpperCase();

  let modsec = "";
  let cloudflare = "";
  let aws = {};

  // 1. Active Probes & Attacks (SQLi, XSS, Path Traversal, Command Injection)
  const isActiveAttack = 
    categoryKey.includes("INJECTION") || 
    titleKey.includes("INJECTION") || 
    categoryKey.includes("SQL") || 
    titleKey.includes("SQL") || 
    categoryKey.includes("XSS") || 
    titleKey.includes("XSS") || 
    categoryKey.includes("PATH TRAVERSAL") || 
    titleKey.includes("TRAVERSAL") || 
    cweKey.includes("CWE-89") || 
    cweKey.includes("CWE-79") || 
    cweKey.includes("CWE-22") || 
    cweKey.includes("CWE-78");

  if (isActiveAttack) {
    let ruleId = "1000001";
    let attackType = "Active Attack Detected";
    let defaultPayload = "";
    let regexPattern = "";

    if (categoryKey.includes("SQL") || titleKey.includes("SQL") || cweKey.includes("CWE-89")) {
      ruleId = "1000001";
      attackType = "SQL Injection";
      defaultPayload = "' OR 1=1 --";
      regexPattern = rawPayload ? escapeModSecRegex(rawPayload) : "(' OR '1'='1|' OR 1=1 --|' UNION SELECT|DROP TABLE|SLEEP\\()";
    } else if (categoryKey.includes("XSS") || titleKey.includes("XSS") || cweKey.includes("CWE-79")) {
      ruleId = "1000002";
      attackType = "Cross-Site Scripting (XSS)";
      defaultPayload = "<script>alert(1)</script>";
      regexPattern = rawPayload ? escapeModSecRegex(rawPayload) : "(<script>|javascript:|onerror=|onload=|alert\\()";
    } else if (categoryKey.includes("PATH TRAVERSAL") || titleKey.includes("TRAVERSAL") || cweKey.includes("CWE-22")) {
      ruleId = "1000003";
      attackType = "Path Traversal";
      defaultPayload = "../../../../etc/passwd";
      regexPattern = rawPayload ? escapeModSecRegex(rawPayload) : "(\\.\\./|\\.\\.\\\\|/etc/passwd|win\\.ini)";
    } else {
      ruleId = "1000004";
      attackType = "Command Injection";
      defaultPayload = "; whoami";
      regexPattern = rawPayload ? escapeModSecRegex(rawPayload) : "(;|&&|\\||whoami|uname|ipconfig|ifconfig)";
    }

    const activePayload = rawPayload || defaultPayload;
    
    // ModSecurity: Dynamic target path & specific parameter + payload detection
    modsec = `# ModSecurity Rule: Block potential ${attackType} on ${path} (${param})\n`;
    modsec += `SecRule REQUEST_FILENAME "@eq ${path}" \\\n`;
    modsec += `    "id:${ruleId},phase:2,chain,deny,status:403,log,msg:'ATHX-WAF: ${attackType} Blocked on parameter ${param}'"\n`;
    modsec += `    SecRule ARGS:${param} "@rx ${regexPattern}"\n`;

    // Cloudflare: Dynamic target path & query parameter evaluation
    cloudflare = `(http.request.uri.path eq "${path}" and any(http.request.uri.query[*]) contains "${escapeCloudflareString(activePayload)}")`;

    // AWS WAF: Dynamic AndStatement blocking specific query arg
    aws = {
      Name: `ATHX-Block-${attackType.replace(/[^a-zA-Z0-9]/g, "-")}`,
      Priority: parseInt(ruleId) % 100,
      Action: { Block: {} },
      Statement: {
        AndStatement: {
          Statements: [
            {
              ByteMatchStatement: {
                FieldToMatch: { UriPath: {} },
                PositionalConstraint: "EXACTLY",
                SearchString: path,
                TextTransformations: [{ Priority: 0, Type: "NONE" }]
              }
            },
            {
              ByteMatchStatement: {
                FieldToMatch: { SingleQueryArgument: { Name: param } },
                PositionalConstraint: "CONTAINS",
                SearchString: activePayload,
                TextTransformations: [
                  { Priority: 0, Type: "URL_DECODE" },
                  { Priority: 1, Type: "HTML_ENTITY_DECODE" }
                ]
              }
            }
          ]
        }
      },
      VisibilityConfig: {
        CloudWatchMetricsEnabled: true,
        MetricName: `ATHXBlock${attackType.replace(/[^a-zA-Z0-9]/g, "")}`,
        SampledRequestsEnabled: true
      }
    };

  } else if (categoryKey.includes("EXPOSED") || titleKey.includes("EXPOSED") || titleKey.includes("CONFIGURATION")) {
    // 2. Sensitive Directory / File Exposure (e.g. .git, .env)
    const blockPath = path || "/.env";

    modsec = `# ModSecurity Rule: Block access to exposed sensitive file/directory: ${blockPath}\n`;
    modsec += `SecRule REQUEST_FILENAME "@eq ${blockPath}" \\\n`;
    modsec += `    "id:1000020,phase:1,deny,status:403,log,msg:'ATHX-WAF: Blocked access to sensitive configuration path'"\n`;

    cloudflare = `(http.request.uri.path eq "${blockPath}")`;

    aws = {
      Name: "ATHX-Block-Sensitive-File-Path",
      Priority: 20,
      Action: { Block: {} },
      Statement: {
        ByteMatchStatement: {
          FieldToMatch: { UriPath: {} },
          PositionalConstraint: "EXACTLY",
          SearchString: blockPath,
          TextTransformations: [{ Priority: 0, Type: "NONE" }]
        }
      },
      VisibilityConfig: {
        CloudWatchMetricsEnabled: true,
        MetricName: "ATHXBlockSensitiveFilePath",
        SampledRequestsEnabled: true
      }
    };

  } else if (categoryKey.includes("CORS") || titleKey.includes("CORS")) {
    // 3. CORS Policies Misconfigurations
    modsec = `# ModSecurity Rule: Restrict wildcards and enforce strict Origin checks\n`;
    modsec += `SecRule REQUEST_HEADERS:Origin "@rx ^null$" \\\n`;
    modsec += `    "id:1000030,phase:1,deny,status:403,log,msg:'ATHX-WAF: Blocked insecure CORS null Origin header'"\n`;

    cloudflare = `(http.request.headers["Origin"] eq "null")`;

    aws = {
      Name: "ATHX-Block-CORS-Null-Origin",
      Priority: 30,
      Action: { Block: {} },
      Statement: {
        ByteMatchStatement: {
          FieldToMatch: { SingleHeader: { Name: "origin" } },
          PositionalConstraint: "EXACTLY",
          SearchString: "null",
          TextTransformations: [{ Priority: 0, Type: "NONE" }]
        }
      },
      VisibilityConfig: {
        CloudWatchMetricsEnabled: true,
        MetricName: "ATHXBlockCORSNullOrigin",
        SampledRequestsEnabled: true
      }
    };

  } else if (categoryKey.includes("HEADER") || titleKey.includes("HEADER") || cweKey.includes("CWE-693")) {
    // 4. Missing Security Headers or Response Header disclosures
    if (titleKey.includes("DISCLOSURE") || titleKey.includes("SERVER") || titleKey.includes("FINGERPRINT")) {
      // Server information disclosure -> Strip responses
      modsec = `# ModSecurity Rule: Strip Server information disclosure headers from responses\n`;
      modsec += `Header unset Server\n`;
      modsec += `Header unset X-Powered-By\n`;

      cloudflare = `# Cloudflare Ruleset: Configure a Response Header Modification rule to REMOVE:\n`;
      cloudflare += `- "Server" header\n`;
      cloudflare += `- "X-Powered-By" header`;

      aws = {
        Name: "ATHX-Strip-Disclosure-Headers",
        Comment: "AWS WAF cannot modify response headers directly. Use CloudFront Response Headers Policies to remove 'Server' and 'X-Powered-By'."
      };
    } else {
      // Missing protection headers -> Inject/Add
      let missingHeader = "X-Frame-Options";
      let headerValue = "DENY";

      if (titleKey.includes("CONTENT-SECURITY") || titleKey.includes("CSP")) {
        missingHeader = "Content-Security-Policy";
        headerValue = "default-src 'self'; frame-ancestors 'self';";
      } else if (titleKey.includes("HSTS") || titleKey.includes("TRANSPORT")) {
        missingHeader = "Strict-Transport-Security";
        headerValue = "max-age=31536000; includeSubDomains";
      } else if (titleKey.includes("CONTENT-TYPE") || titleKey.includes("NOSNIFF")) {
        missingHeader = "X-Content-Type-Options";
        headerValue = "nosniff";
      }

      modsec = `# ModSecurity Rule: Inject missing security response header: ${missingHeader}\n`;
      modsec += `Header set ${missingHeader} "${headerValue}"\n`;

      cloudflare = `# Cloudflare Ruleset: Configure a Response Header Modification rule to ADD:\n`;
      cloudflare += `Header: "${missingHeader}" Value: "${headerValue}"`;

      aws = {
        Name: `ATHX-Inject-Header-${missingHeader.replace(/[^a-zA-Z0-9]/g, "")}`,
        Comment: `Use AWS CloudFront Response Headers Policies to add Header: ${missingHeader} with Value: ${headerValue}.`
      };
    }

  } else if (categoryKey.includes("COOKIE") || titleKey.includes("COOKIE")) {
    // 5. Hardening Cookie flags (Secure, HttpOnly, SameSite)
    modsec = `# ModSecurity Rule: Enforce Secure, HttpOnly, and SameSite flags on all cookies\n`;
    modsec += `Header edit Set-Cookie ^(.*)$ "$1; Secure; HttpOnly; SameSite=Strict"\n`;

    cloudflare = `# Cloudflare Ruleset: Configure a response modification rule to enrich Set-Cookie attributes:\n`;
    cloudflare += `Append: "; Secure; HttpOnly; SameSite=Strict" to Set-Cookie Headers`;

    aws = {
      Name: "ATHX-Enforce-Cookie-Hardening",
      Comment: "Enforce Cookie flags (Secure, HttpOnly) directly on the Application Load Balancer or origin server settings."
    };

  } else if (categoryKey.includes("RATE") || titleKey.includes("RATE")) {
    // 6. Rate Limiting enforcement
    modsec = `# ModSecurity Rule: Enforce request rate limit dynamically for ${path}\n`;
    modsec += `SecAction "initcol:IP=%{REMOTE_ADDR},id:1000060,pass"\n`;
    modsec += `SecRule REQUEST_FILENAME "@eq ${path}" "phase:1,chain,deny,status:429,log,msg:'ATHX-WAF: Rate Limit Exceeded'"\n`;
    modsec += `    SecRule IP:REQUEST_RATE "@gt 100" "setvar:IP.REQUEST_RATE=+1,expire:60"\n`;

    cloudflare = `(http.request.uri.path eq "${path}")\n# Set Rate Limit Settings: Limit to 100 requests per 1 minute per IP.`;

    aws = {
      Name: "ATHX-Rate-Limit-Rule",
      Priority: 60,
      Action: { Block: {} },
      Statement: {
        RateBasedStatement: {
          Limit: 100,
          EvaluationWindowSec: 60,
          AggregateKeyType: "IP",
          ScopeDownStatement: {
            ByteMatchStatement: {
              FieldToMatch: { UriPath: {} },
              PositionalConstraint: "EXACTLY",
              SearchString: path,
              TextTransformations: [{ Priority: 0, Type: "NONE" }]
            }
          }
        }
      },
      VisibilityConfig: {
        CloudWatchMetricsEnabled: true,
        MetricName: "ATHXRateLimitRule",
        SampledRequestsEnabled: true
      }
    };

  } else {
    // 7. Fallback: Generic request monitoring for endpoint path
    modsec = `# ModSecurity Rule: Monitor requests targeting ${path}\n`;
    modsec += `SecRule REQUEST_FILENAME "@eq ${path}" \\\n`;
    modsec += `    "id:1000099,phase:1,pass,log,msg:'ATHX-WAF: Auditing request path ${path}'"\n`;

    cloudflare = `(http.request.uri.path eq "${path}")`;

    aws = {
      Name: "ATHX-Audit-Path-Requests",
      Priority: 99,
      Action: { Allow: {} },
      Statement: {
        ByteMatchStatement: {
          FieldToMatch: { UriPath: {} },
          PositionalConstraint: "EXACTLY",
          SearchString: path,
          TextTransformations: [{ Priority: 0, Type: "NONE" }]
        }
      },
      VisibilityConfig: {
        CloudWatchMetricsEnabled: true,
        MetricName: "ATHXAuditPathRequests",
        SampledRequestsEnabled: true
      }
    };
  }

  return {
    modsec,
    cloudflare,
    aws: typeof aws === "string" ? aws : JSON.stringify(aws, null, 2)
  };
};
