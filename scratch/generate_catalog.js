const fs = require("fs");
const path = require("path");

// Categories & vulnerable profiles
const BOLA = [];
const BUA = [];
const BOPLA = [];
const URC = [];
const BFLA = [];
const UASBF = [];
const SSRF = [];
const SM = [];
const INJ = [];
const CRYPTO = [];
const WEB_OTHER = [];

// 1. BOLA (Broken Object Level Authorization) - 32 items
const bolaTemplates = [
  { sub: "User Profile", resource: "user profile details", cwe: "CWE-639", cvss: 8.5 },
  { sub: "Invoice PDF", resource: "billing invoice document", cwe: "CWE-639", cvss: 7.8 },
  { sub: "Order Status", resource: "customer order history details", cwe: "CWE-639", cvss: 8.1 },
  { sub: "Shopping Cart", resource: "active shopping cart contents", cwe: "CWE-639", cvss: 7.2 },
  { sub: "Chat Messages", resource: "support ticket chat log", cwe: "CWE-639", cvss: 7.5 },
  { sub: "Shipping Address", resource: "customer shipping address metadata", cwe: "CWE-639", cvss: 8.2 },
  { sub: "Payment Method", resource: "saved credit card token details", cwe: "CWE-639", cvss: 8.8 },
  { sub: "API Key Metadata", resource: "developer API key attributes", cwe: "CWE-639", cvss: 7.9 },
  { sub: "Notification Logs", resource: "system alert notification logs", cwe: "CWE-639", cvss: 6.8 },
  { sub: "Account Recovery Token", resource: "password reset recovery token details", cwe: "CWE-639", cvss: 9.3 },
  { sub: "Subscription Info", resource: "recurring SaaS subscription details", cwe: "CWE-639", cvss: 7.0 },
  { sub: "Organization Org Chart", resource: "enterprise organization chart records", cwe: "CWE-639", cvss: 6.5 },
  { sub: "Document Attachment", resource: "uploaded file attachments list", cwe: "CWE-639", cvss: 8.0 },
  { sub: "Virtual Machine Info", resource: "cloud compute VM instance metadata", cwe: "CWE-639", cvss: 8.3 },
  { sub: "Database Backup Link", resource: "scheduled database backup metadata link", cwe: "CWE-639", cvss: 9.1 },
  { sub: "Inventory Record", resource: "warehouse product stock inventory entry", cwe: "CWE-639", cvss: 6.2 },
  { sub: "Vulnerability Report", resource: "active security scanner bug reports", cwe: "CWE-639", cvss: 8.7 },
  { sub: "Health Metric", resource: "server node health metric indicators", cwe: "CWE-639", cvss: 5.8 },
  { sub: "Admin Log", resource: "administrative action trail events", cwe: "CWE-639", cvss: 7.4 },
  { sub: "Referral Code Info", resource: "promotional referral program rewards data", cwe: "CWE-639", cvss: 6.0 },
  { sub: "Internal Comment", resource: "moderator internal comments list", cwe: "CWE-639", cvss: 6.7 },
  { sub: "File Export Task", resource: "completed report CSV export task", cwe: "CWE-639", cvss: 7.1 },
  { sub: "Calendar Invite", resource: "calendar appointment scheduling details", cwe: "CWE-639", cvss: 6.9 },
  { sub: "IP Address Log", resource: "user login location logs", cwe: "CWE-639", cvss: 6.3 },
  { sub: "Webhook Endpoint Configuration", resource: "registered webhook integration configuration", cwe: "CWE-639", cvss: 7.6 },
  { sub: "License Key Info", resource: "purchased license key authorization data", cwe: "CWE-639", cvss: 8.4 },
  { sub: "Audit Check Log", resource: "compliance audit check status", cwe: "CWE-639", cvss: 5.5 },
  { sub: "Feedback Form Response", resource: "submitted customer feedback forms", cwe: "CWE-639", cvss: 6.1 },
  { sub: "SMS Status Code Details", resource: "outgoing SMS transaction records", cwe: "CWE-639", cvss: 7.3 },
  { sub: "Project Dashboard Metadata", resource: "project collaboration board information", cwe: "CWE-639", cvss: 7.7 },
  { sub: "Resource Reservation Details", resource: "physical resource reservation details", cwe: "CWE-639", cvss: 6.6 },
  { sub: "Tenant Config Details", resource: "multi-tenant resource config configurations", cwe: "CWE-639", cvss: 8.6 }
];

bolaTemplates.forEach((t, i) => {
  const code = `BOLA_${t.sub.toUpperCase().replace(/[\s-]/g, "_")}`;
  BOLA.push({
    key: code,
    severity: t.cvss >= 9.0 ? "critical" : (t.cvss >= 7.0 ? "high" : "medium"),
    cvss: t.cvss,
    title: `Broken Object Level Authorization in ${t.sub}`,
    description: `An attacker can access or modify another user's ${t.resource} by manipulating object identifiers (like IDs) in the API request path or parameters.`,
    recommendation: `Implement strict access control verification checks at the controller level to verify the requesting user owns the requested ${t.resource}.`,
    cwe: t.cwe,
    owasp: "API1:2023 Broken Object Level Authorization",
    category: "Broken Object Level Authorization",
    references: ["https://owasp.org/API-Security/editions/2023/en/0x11-t10-broken-object-level-authorization/"],
    remediationSteps: [
      `Validate that the authenticated session owns the target identifier.`,
      `Enforce authorization checks dynamically on every database query payload.`,
      `Use cryptographically secure random identifiers (UUID v4) instead of sequential integers.`
    ]
  });
});

// 2. BUA (Broken User Authentication) - 32 items
const buaTemplates = [
  { sub: "Weak Password Constraints", desc: "Allows users to set easily guessable passwords.", rec: "Enforce password length, complexity and check against lists of breached credentials.", cwe: "CWE-521", cvss: 6.5 },
  { sub: "Credential Stuffing Vulnerability", desc: "No protection against automated password brute force attempts.", rec: "Implement IP rate limiting, account lockout policies, and CAPTCHA screens.", cwe: "CWE-307", cvss: 8.1 },
  { sub: "Two-Factor Auth Bypass", desc: "Weak validation of 2FA validation codes allows brute-forcing codes.", rec: "Rate limit 2FA input attempts and invalidate codes after single use.", cwe: "CWE-287", cvss: 8.8 },
  { sub: "Session Fixation", desc: "Session ID is not rotated or regenerated after successful user login.", rec: "Regenerate session identifiers upon change in authentication state.", cwe: "CWE-384", cvss: 7.5 },
  { sub: "Hardcoded Admin Credentials", desc: "Static credentials found in config properties or source files.", rec: "Inject configurations using secure environment variables or vault engines.", cwe: "CWE-798", cvss: 9.8 },
  { sub: "Unsigned JWT Verification", desc: "The application accepts JWT tokens signed with the 'none' algorithm.", rec: "Enforce asymmetric algorithms and reject none algorithms explicitly.", cwe: "CWE-347", cvss: 9.5 },
  { sub: "Long-Lived JWT Validity", desc: "JSON Web Tokens remain valid for weeks or months without expiry.", rec: "Issue tokens with short expirations (e.g., 15 mins) and use secure refresh tokens.", cwe: "CWE-613", cvss: 6.8 },
  { sub: "JWT Secret Key Entropy Weak", desc: "Symmetric JWT signatures use a weak, easily guessable passphrase.", rec: "Generate strong cryptographic secrets containing at least 256 bits of entropy.", cwe: "CWE-328", cvss: 8.3 },
  { sub: "Password Recovery Token Prediction", desc: "Password recovery tokens generated using insecure timestamps or randoms.", rec: "Use secure random number generators (CSPRNG) for token generation.", cwe: "CWE-331", cvss: 8.4 },
  { sub: "Insecure Remember-Me Feature", desc: "Uses cleartext or static hash credentials stored in client-side cookies.", rec: "Use one-time token values with strict server-side validation tables.", cwe: "CWE-539", cvss: 7.1 },
  { sub: "Lack of Login Account Lockout", desc: "Attacker can run infinite login attempts without triggering lockout triggers.", rec: "Lock account temporarily after 5 failed authentication attempts.", cwe: "CWE-307", cvss: 7.4 },
  { sub: "OAuth Redirect Uri Validation Bypass", desc: "Redirect parameter is not validated, permitting token leakage to phishing targets.", rec: "Only permit redirect URLs registered in static target allowlists.", cwe: "CWE-601", cvss: 7.9 },
  { sub: "Sensitive Token in URL Parameter", desc: "Authentication token passed via query parameters, leaking to proxy logs.", rec: "Pass credentials only through standard Authorization headers or Secure cookies.", cwe: "CWE-598", cvss: 6.9 },
  { sub: "Broken Password Reset Token Revocation", desc: "Old password reset links remain active after password has been changed.", rec: "Immediately revoke reset tokens upon password update completions.", cwe: "CWE-613", cvss: 7.2 },
  { sub: "Lack of MFA on Email Changes", desc: "Account settings allow changing email address without verifying credentials.", rec: "Require current password check and MFA validation before sensitive actions.", cwe: "CWE-306", cvss: 8.0 },
  { sub: "Session Identifier Entropy Weak", desc: "Session IDs are short or easily predictable integers.", rec: "Use built-in secure session generators (e.g. express-session).", cwe: "CWE-330", cvss: 8.2 },
  { sub: "Missing Authorization Bearer Verification", desc: "Endpoint allows requests omitting the authorization scheme headers.", rec: "Enforce token requirements on all non-public controllers.", cwe: "CWE-306", cvss: 8.6 },
  { sub: "Anonymous Password Recovery Access", desc: "Allows password changes by presenting username only without security tokens.", rec: "Enforce multi-step identity verification schemas before permitting resets.", cwe: "CWE-306", cvss: 9.0 },
  { sub: "Basic Authentication over HTTP", desc: "Basic auth credentials transmitted over unencrypted HTTP lines.", rec: "Enforce strict transport layer security (HTTPS) on all paths.", cwe: "CWE-319", cvss: 7.7 },
  { sub: "CSRF Token Invalidation Lack", desc: "Session changes do not update corresponding cross-site request tokens.", rec: "Generate a new CSRF token for each active session lifecycle.", cwe: "CWE-352", cvss: 6.3 },
  { sub: "Token Storage in Browser LocalStorage", desc: "Sensitive JWT access tokens stored in LocalStorage, vulnerable to XSS.", rec: "Store authorization cookies using HttpOnly and SameSite flags.", cwe: "CWE-922", cvss: 6.1 },
  { sub: "SAML Response XML Signature Validation Missing", desc: "SAML authentication relies on XML claims without validating signatures.", rec: "Enforce cryptographic validation of XML signature nodes.", cwe: "CWE-347", cvss: 8.9 },
  { sub: "JWT Aud Claim Verification Lack", desc: "JWTs from other client apps are accepted without audience validation checks.", rec: "Validate the 'aud' claim to ensure token belongs to current application.", cwe: "CWE-287", cvss: 7.0 },
  { sub: "JWT Iss Claim Verification Lack", desc: "Tokens signed by other issuers are trusted without verify check constraints.", rec: "Enforce list checks against allowed token issuers ('iss').", cwe: "CWE-287", cvss: 7.3 },
  { sub: "Token Introspection Bypass", desc: "Token lifecycle is not verified against introspection tables, tolerating revoked keys.", rec: "Enforce caching checks against central blacklists for revoke states.", cwe: "CWE-287", cvss: 7.6 },
  { sub: "Cookie Scope Overly Broad", desc: "Authorization cookies defined with root domain scope, exposing to subdomains.", rec: "Restrict cookie domain scope parameters to target subdomains only.", cwe: "CWE-565", cvss: 5.8 },
  { sub: "Expired Token Acceptance", desc: "The application parses expired JWT tokens without throwing validation faults.", rec: "Verify 'exp' claims strictly inside token translation filters.", cwe: "CWE-287", cvss: 8.3 },
  { sub: "Missing MFA Enrollment Mandate", desc: "High-privilege admin users bypass multi-factor authentication mandates.", rec: "Enforce mandatory MFA enrollment policy across administrative groups.", cwe: "CWE-306", cvss: 7.8 },
  { sub: "Invalid Signature Key Rollover Handler", desc: "Signature rollover logic retrieves keys dynamically without verification.", rec: "Only accept signature validation keys defined in trusted JWKS endpoints.", cwe: "CWE-347", cvss: 8.5 },
  { sub: "CAPTCHA Implementation Bypass", desc: "CAPTCHA parameters can be omitted or spoofed by removing payload variables.", rec: "Verify CAPTCHA tokens directly against provider endpoints on server side.", cwe: "CWE-841", cvss: 5.7 },
  { sub: "Weak Password Hashing Algorithm", desc: "Storing passwords using SHA-1 or MD5 algorithms.", rec: "Enforce bcrypt, Argon2 or PBKDF2 algorithms.", cwe: "CWE-916", cvss: 8.7 },
  { sub: "Lack of Session Invalidation on Logout", desc: "Tokens remain active on the server after user clicks logout.", rec: "Add token values to an active blacklist or delete state variables on logout.", cwe: "CWE-613", cvss: 7.1 }
];

buaTemplates.forEach((t, i) => {
  const code = `BUA_${t.sub.toUpperCase().replace(/[\s-]/g, "_")}`;
  BUA.push({
    key: code,
    severity: t.cvss >= 9.0 ? "critical" : (t.cvss >= 7.0 ? "high" : "medium"),
    cvss: t.cvss,
    title: t.sub,
    description: t.desc,
    recommendation: t.rec,
    cwe: t.cwe,
    owasp: "API2:2023 Broken Authentication",
    category: "Broken User Authentication",
    references: ["https://owasp.org/API-Security/editions/2023/en/0x12-t10-broken-authentication/"],
    remediationSteps: [
      `Implement strong validation libraries checking input requirements.`,
      `Rotate session tokens on privilege level transitions.`,
      `Log authentication events to monitor credentials abuse.`
    ]
  });
});

// 3. BOPLA (Broken Object Property Level Authorization) - 32 items
const boplaTemplates = [
  { sub: "Mass Assignment in User Profile Creation", prop: "role", cwe: "CWE-915", cvss: 8.8 },
  { sub: "Mass Assignment in Admin Account Registration", prop: "isAdmin", cwe: "CWE-915", cvss: 9.3 },
  { sub: "Mass Assignment in Order Update", prop: "totalPrice", cwe: "CWE-915", cvss: 7.8 },
  { sub: "Mass Assignment in Billing Details Update", prop: "balance", cwe: "CWE-915", cvss: 8.1 },
  { sub: "Mass Assignment in Document Settings", prop: "isPublic", cwe: "CWE-915", cvss: 7.2 },
  { sub: "Mass Assignment in Project Meta Settings", prop: "ownerId", cwe: "CWE-915", cvss: 8.0 },
  { sub: "Mass Assignment in Organization Config", prop: "tierLimit", cwe: "CWE-915", cvss: 7.5 },
  { sub: "Mass Assignment in License Verification", prop: "isValidated", cwe: "CWE-915", cvss: 8.5 },
  { sub: "Mass Assignment in Virtual Machine Setup", prop: "vcpus", cwe: "CWE-915", cvss: 7.4 },
  { sub: "Mass Assignment in Audit Logging Settings", prop: "logLevel", cwe: "CWE-915", cvss: 6.8 },
  { sub: "Mass Assignment in Coupon Code Generation", prop: "discountPct", cwe: "CWE-915", cvss: 7.9 },
  { sub: "Mass Assignment in Session State Config", prop: "sessionMaxAge", cwe: "CWE-915", cvss: 7.0 },
  { sub: "Sensitive Property Disclosure in Profile Payload", prop: "passwordHash", cwe: "CWE-200", cvss: 7.3 },
  { sub: "Sensitive Property Disclosure in Admin Member Payload", prop: "backupRecoveryCodes", cwe: "CWE-200", cvss: 8.6 },
  { sub: "Sensitive Property Disclosure in Invoice Metadata", prop: "creditScore", cwe: "CWE-200", cvss: 7.1 },
  { sub: "Sensitive Property Disclosure in Order Receipt Details", prop: "internalSalesNotes", cwe: "CWE-200", cvss: 6.5 },
  { sub: "Sensitive Property Disclosure in Compute Instance Info", prop: "privateSshKey", cwe: "CWE-200", cvss: 9.0 },
  { sub: "Sensitive Property Disclosure in Alert Log History", prop: "internalIPAddresses", cwe: "CWE-200", cvss: 6.2 },
  { sub: "Sensitive Property Disclosure in Support Thread", prop: "creditCardCvv", cwe: "CWE-200", cvss: 8.7 },
  { sub: "Sensitive Property Disclosure in Org Workspace Payload", prop: "billingPasscode", cwe: "CWE-200", cvss: 7.7 },
  { sub: "Sensitive Property Disclosure in License Keys List", prop: "signatureCheckPasskey", cwe: "CWE-200", cvss: 8.2 },
  { sub: "Sensitive Property Disclosure in SMS Config API", prop: "smsProviderSecretKey", cwe: "CWE-200", cvss: 8.4 },
  { sub: "Mass Assignment in Subscription Plan Changes", prop: "priceRate", cwe: "CWE-915", cvss: 7.6 },
  { sub: "Mass Assignment in User Organization Assignment", prop: "orgId", cwe: "CWE-915", cvss: 8.3 },
  { sub: "Mass Assignment in File Upload Attachment Properties", prop: "storageBucket", cwe: "CWE-915", cvss: 6.9 },
  { sub: "Mass Assignment in Feedback Submission Variables", prop: "userId", cwe: "CWE-915", cvss: 6.1 },
  { sub: "Sensitive Property Disclosure in VM Network State", prop: "gatewayAuthToken", cwe: "CWE-200", cvss: 8.9 },
  { sub: "Sensitive Property Disclosure in Document Attachment Records", prop: "internalBucketLocation", cwe: "CWE-200", cvss: 6.7 },
  { sub: "Sensitive Property Disclosure in SMS Verification Data", prop: "passcodeValidationKey", cwe: "CWE-200", cvss: 8.0 },
  { sub: "Sensitive Property Disclosure in Referral Payout Data", prop: "bankingIbanNumber", cwe: "CWE-200", cvss: 7.4 },
  { sub: "Mass Assignment in Physical Resource Settings", prop: "maintenanceWindow", cwe: "CWE-915", cvss: 5.8 },
  { sub: "Mass Assignment in Tenant Meta Profiles", prop: "tenantSubdomain", cwe: "CWE-915", cvss: 7.0 }
];

boplaTemplates.forEach((t, i) => {
  const code = `BOPLA_${t.sub.toUpperCase().replace(/[\s-]/g, "_")}`;
  const isMassAssignment = t.cwe === "CWE-915";
  BOPLA.push({
    key: code,
    severity: t.cvss >= 9.0 ? "critical" : (t.cvss >= 7.0 ? "high" : "medium"),
    cvss: t.cvss,
    title: t.sub,
    description: isMassAssignment 
      ? `The endpoint accepts arbitrary input parameters during requests, allowing clients to modify read-only metadata parameters like "${t.prop}" due to lack of strict parameter binding controls.`
      : `The response payload contains sensitive internal data properties like "${t.prop}" that should not be exposed to the requesting user group.`,
    recommendation: isMassAssignment
      ? `Enforce a strict whitelist approach for allowed query request parameters. Avoid auto-mapping raw request bodies directly to database objects.`
      : `Implement response DTOs or serializers that selectively filter output object properties.`,
    cwe: t.cwe,
    owasp: "API3:2023 Broken Object Property Level Authorization",
    category: "Broken Object Property Level Authorization",
    references: ["https://owasp.org/API-Security/editions/2023/en/0x13-t10-broken-object-property-level-authorization/"],
    remediationSteps: [
      isMassAssignment ? `Use Data Transfer Objects (DTOs) with defined validation parameters.` : `Enforce mapping serializer structures before resolving network responses.`,
      `Implement role verification checks before modifying sensitive model properties.`,
      `Review class properties for security properties that require special protection.`
    ]
  });
});

// 4. URC (Unrestricted Resource Consumption) - 32 items
const urcTemplates = [
  { sub: "Payload Size Check Missing", resource: "excessive request bodies", limit: "size check limits", cwe: "CWE-770", cvss: 7.1 },
  { sub: "Image Upload Scaling Abuse", resource: "unrestricted pixel processing sizes", limit: "resolution resizing limits", cwe: "CWE-400", cvss: 6.8 },
  { sub: "Nested Query Depth Recursion", resource: "GraphQL deep nested queries", limit: "depth limits check validation", cwe: "CWE-674", cvss: 7.8 },
  { sub: "Export Size Request Flood", resource: "limitless PDF export reports", limit: "export parameter limits", cwe: "CWE-770", cvss: 6.5 },
  { sub: "Notification Message Spam", resource: "limitless phone notification runs", limit: "per-user notification rate limits", cwe: "CWE-770", cvss: 7.4 },
  { sub: "Compute Reservation Attack", resource: "excessive cloud computation tasks", limit: "concurrency locks limit checks", cwe: "CWE-400", cvss: 8.0 },
  { sub: "Billing API Iteration Exhaustion", resource: "automated balance search runs", limit: "rate limits check policies", cwe: "CWE-770", cvss: 7.2 },
  { sub: "Avatar Image File Zip Bomb", resource: "recursive file zip structures", limit: "decompression size guard limits", cwe: "CWE-409", cvss: 8.5 },
  { sub: "Compute Node CPU Intensive Task Access", resource: "complex cryptographical hash functions", limit: "process time timeout limits", cwe: "CWE-400", cvss: 7.9 },
  { sub: "Audit Logging Buffer Attack", resource: "high volume error trace generation", limit: "logging rate limits policies", cwe: "CWE-770", cvss: 6.0 },
  { sub: "Coupon Check Processing Starvation", resource: "exhaustive coupon code calculations", limit: "calculation processing timeouts", cwe: "CWE-400", cvss: 6.3 },
  { sub: "Token Authentication Check Memory Leak", resource: "invalid login verification caches", limit: "cache size invalidation controls", cwe: "CWE-400", cvss: 7.5 },
  { sub: "SMS Verification Requests Flood", resource: "limitless SMS OTP messages", limit: "phone rate limits policies", cwe: "CWE-770", cvss: 8.2 },
  { sub: "Search Index Regular Expression Abuse", resource: "complex query regex search strings", limit: "regex search timeouts", cwe: "CWE-400", cvss: 7.3 },
  { sub: "Feedback Submission Database Lockup", resource: "high volume feedback submission records", limit: "table storage write limits", cwe: "CWE-770", cvss: 6.7 },
  { sub: "Document Attachment Limit Lack", resource: "limitless file attachment counts", limit: "maximum upload arrays validation", cwe: "CWE-770", cvss: 7.0 },
  { sub: "Virtual Machine Log Exhaustion", resource: "limitless debug metadata print loops", limit: "logging storage check limits", cwe: "CWE-770", cvss: 6.9 },
  { sub: "Org Chart Nested Query Loop", resource: "infinite child nodes org structures", limit: "nesting depth limits logic", cwe: "CWE-674", cvss: 5.8 },
  { sub: "License Key Check Timeout Leak", resource: "offline decryption validation tasks", limit: "encryption timeout verification checks", cwe: "CWE-400", cvss: 7.6 },
  { sub: "Physical Resource Reservation Pool Starvation", resource: "limitless calendar timeslot requests", limit: "timeslot maximum reservation limit", cwe: "CWE-400", cvss: 7.7 },
  { sub: "Project Dashboard Export Memory Crash", resource: "excel sheet database report compilations", limit: "background processing queue limits", cwe: "CWE-400", cvss: 8.1 },
  { sub: "SaaS Tenant Allocation Flood", resource: "limitless staging environment provisions", limit: "per-account resource validation checks", cwe: "CWE-770", cvss: 8.4 },
  { sub: "SMS OTP Request Script Injection", resource: "limitless text message triggers", limit: "recipient rate limit rules", cwe: "CWE-770", cvss: 8.3 },
  { sub: "User Profile XML Entity Processing", resource: "recursive XML entity parse tasks", limit: "entity processing disable rules", cwe: "CWE-776", cvss: 8.7 },
  { sub: "File Attachment Storage Exhaustion", resource: "limitless backup attachments", limit: "bucket capacity limits", cwe: "CWE-770", cvss: 8.8 },
  { sub: "Feedback DB Storage Flood", resource: "automated form submission triggers", limit: "rate limits check rules", cwe: "CWE-770", cvss: 6.6 },
  { sub: "VM Node RAM Starvation", resource: "exhaustive virtual memory buffer requests", limit: "RAM allocation validation policies", cwe: "CWE-400", cvss: 8.6 },
  { sub: "Document PDF Convert CPU Spike", resource: "unrestricted page count PDF render tasks", limit: "page count validation limits", cwe: "CWE-400", cvss: 8.2 },
  { sub: "SMS Auth Gateway Billing Exhaustion", resource: "limitless authentication OTP SMS runs", limit: "IP-based limit policies", cwe: "CWE-770", cvss: 8.9 },
  { sub: "Referral Program Reward Point Abuse", resource: "automated user referral registration loops", limit: "daily registration checks", cwe: "CWE-770", cvss: 7.5 },
  { sub: "Physical Calendar Slot Collision", resource: "simultaneous reservation lock runs", limit: "optimistic database locking limits", cwe: "CWE-400", cvss: 6.2 },
  { sub: "Tenant Resource Allocation Exhaustion", resource: "uncontrolled sub-resource allocation requests", limit: "system limits checks", cwe: "CWE-770", cvss: 8.0 }
];

urcTemplates.forEach((t, i) => {
  const code = `URC_${t.sub.toUpperCase().replace(/[\s-]/g, "_")}`;
  BOPLA.push({
    key: code,
    severity: t.cvss >= 9.0 ? "critical" : (t.cvss >= 7.0 ? "high" : "medium"),
    cvss: t.cvss,
    title: t.sub,
    description: `An attacker can trigger excessive resource consumption (CPU, Memory, Network, or API Billing logs) via ${t.resource} because the endpoint lacks proper ${t.limit}.`,
    recommendation: `Enforce strict payload validation and ${t.limit} on resource-intensive endpoints.`,
    cwe: t.cwe,
    owasp: "API4:2023 Unrestricted Resource Consumption",
    category: "Unrestricted Resource Consumption",
    references: ["https://owasp.org/API-Security/editions/2023/en/0x14-t10-unrestricted-resource-consumption/"],
    remediationSteps: [
      `Configure request body size limits in standard web server configuration files.`,
      `Implement API rate limits and throttling rules globally.`,
      `Validate input array sizes and depth complexity before processing queries.`
    ]
  });
});

// 5. BFLA (Broken Function Level Authorization) - 32 items
const bflaTemplates = [
  { sub: "Administrative Route Exposure", endpoint: "/api/admin/users", action: "delete users", cwe: "CWE-285", cvss: 9.3 },
  { sub: "Billing Settings Modification Access", endpoint: "/api/billing/rates", action: "modify rate configurations", cwe: "CWE-285", cvss: 8.8 },
  { sub: "Compute Node Restart Execution", endpoint: "/api/vm/restart", action: "trigger reboot sequence", cwe: "CWE-285", cvss: 8.5 },
  { sub: "Audit Trails Cleanup Privilege", endpoint: "/api/audit/clear", action: "clear history logs", cwe: "CWE-285", cvss: 9.0 },
  { sub: "Organization Membership Management Access", endpoint: "/api/org/remove", action: "evict member accounts", cwe: "CWE-285", cvss: 8.1 },
  { sub: "Document Attachment Storage Configuration Settings", endpoint: "/api/storage/bucket", action: "change destination buckets", cwe: "CWE-285", cvss: 8.6 },
  { sub: "License Key Issue Access", endpoint: "/api/license/issue", action: "generate authorization keys", cwe: "CWE-285", cvss: 8.7 },
  { sub: "SMS Provider API Key Settings Access", endpoint: "/api/sms/keys", action: "edit SMS provider credentials", cwe: "CWE-285", cvss: 9.5 },
  { sub: "Virtual Machine Instance Terminate Privilege", endpoint: "/api/vm/destroy", action: "destroy compute nodes", cwe: "CWE-285", cvss: 9.1 },
  { sub: "User Profile Delete Permission Lack", endpoint: "/api/users/profile/delete", action: "remove profiles", cwe: "CWE-285", cvss: 8.0 },
  { sub: "Audit Log Configuration Edit Access", endpoint: "/api/logs/settings", action: "configure log routing", cwe: "CWE-285", cvss: 7.8 },
  { sub: "Physical Resource Booking Cancel Privilege", endpoint: "/api/calendar/cancel-all", action: "revoke customer bookings", cwe: "CWE-285", cvss: 7.5 },
  { sub: "Coupon Generation Config Access", endpoint: "/api/coupons/create", action: "mint coupon codes", cwe: "CWE-285", cvss: 8.2 },
  { sub: "Feedback Form Moderation Controls", endpoint: "/api/feedback/approve", action: "moderate user submissions", cwe: "CWE-285", cvss: 7.2 },
  { sub: "Referral Rewards Adjustment Access", endpoint: "/api/rewards/credit", action: "add promotion balance", cwe: "CWE-285", cvss: 8.3 },
  { sub: "Tenant Subscription Upgrade Controls", endpoint: "/api/tenant/plan", action: "modify tier entitlements", cwe: "CWE-285", cvss: 8.9 },
  { sub: "Compute Node Console Access", endpoint: "/api/vm/terminal", action: "open console streams", cwe: "CWE-285", cvss: 9.8 },
  { sub: "Document Settings Read Access Broad", endpoint: "/api/documents/internal", action: "browse unpublished files", cwe: "CWE-285", cvss: 7.0 },
  { sub: "SMS Routing Rules Update Control", endpoint: "/api/sms/routing", action: "modify destination routers", cwe: "CWE-285", cvss: 8.4 },
  { sub: "Physical Calendar Resource Allocation Override", endpoint: "/api/calendar/override", action: "reallocate asset assignments", cwe: "CWE-285", cvss: 7.4 },
  { sub: "Project Dashboard Delete Action", endpoint: "/api/project/delete", action: "delete active projects", cwe: "CWE-285", cvss: 8.2 },
  { sub: "SaaS Workspace Terminate Access", endpoint: "/api/workspaces/purge", action: "purge metadata profiles", cwe: "CWE-285", cvss: 9.2 },
  { sub: "Database Settings Migration Trigger", endpoint: "/api/db/migrate", action: "run schema changes", cwe: "CWE-285", cvss: 9.4 },
  { sub: "API Documentation Edit Access", endpoint: "/api/docs/update", action: "modify reference guidelines", cwe: "CWE-285", cvss: 6.8 },
  { sub: "User Session Revoke Action", endpoint: "/api/sessions/revoke-all", action: "terminate other active sessions", cwe: "CWE-285", cvss: 7.9 },
  { sub: "File Attachment Storage Purge Privilege", endpoint: "/api/storage/purge", action: "purge files", cwe: "CWE-285", cvss: 8.6 },
  { sub: "Feedback DB Schema Alter Privilege", endpoint: "/api/feedback/schema", action: "modify feedback tables", cwe: "CWE-285", cvss: 8.7 },
  { sub: "VM Hardware Settings Modify Access", endpoint: "/api/vm/hardware", action: "change server instances configurations", cwe: "CWE-285", cvss: 8.5 },
  { sub: "Document PDF Engine Reset Trigger", endpoint: "/api/pdf/engine/reset", action: "restart conversion server", cwe: "CWE-285", cvss: 7.1 },
  { sub: "SMS Provider Connection Diagnostic Run", endpoint: "/api/sms/test-connection", action: "execute custom network ping test scripts", cwe: "CWE-285", cvss: 7.3 },
  { sub: "Referral Scheme Code Invalidation", endpoint: "/api/referrals/invalidate", action: "terminate referral campaigns", cwe: "CWE-285", cvss: 6.5 },
  { sub: "Tenant Organization Database Setup Trigger", endpoint: "/api/tenants/db/setup", action: "provision tenant schema", cwe: "CWE-285", cvss: 9.1 }
];

bflaTemplates.forEach((t, i) => {
  const code = `BFLA_${t.sub.toUpperCase().replace(/[\s-]/g, "_")}`;
  BFLA.push({
    key: code,
    severity: t.cvss >= 9.0 ? "critical" : (t.cvss >= 7.0 ? "high" : "medium"),
    cvss: t.cvss,
    title: t.sub,
    description: `An unprivileged user can make requests to "${t.endpoint}" and successfully perform sensitive operations like "${t.action}" due to lack of role-based function level authorization checks.`,
    recommendation: `Implement strict role-based access control (RBAC) middleware verifying that user profiles possess appropriate administrative groups before resolving requests.`,
    cwe: t.cwe,
    owasp: "API5:2023 Broken Function Level Authorization",
    category: "Broken Function Level Authorization",
    references: ["https://owasp.org/API-Security/editions/2023/en/0x15-t10-broken-function-level-authorization/"],
    remediationSteps: [
      `Enforce authorization checks matching user privileges directly on all routes.`,
      `Deny route access requests by default, and define white-list access schemas.`,
      `Verify user permissions for every HTTP request action method (e.g. GET vs DELETE).`
    ]
  });
});

// 6. UASBF (Unrestricted Access to Sensitive Business Flows) - 32 items
const uasbfTemplates = [
  { sub: "Automated Ticket Scalping", flow: "booking ticket slots", cwe: "CWE-799", cvss: 7.5 },
  { sub: "Coupon Guessing Automation", flow: "applying discount codes", cwe: "CWE-799", cvss: 6.8 },
  { sub: "SMS Verification Flooding", flow: "requesting verification OTP codes", cwe: "CWE-799", cvss: 8.1 },
  { sub: "User Sign Up Spamming", flow: "registering new user profiles", cwe: "CWE-799", cvss: 7.2 },
  { sub: "Feedback Form Auto Submission", flow: "submitting support messages", cwe: "CWE-799", cvss: 6.0 },
  { sub: "Resource Allocation Inventory Locking", flow: "locking shopping cart reservations", cwe: "CWE-799", cvss: 7.4 },
  { sub: "Referral Account Generation Abuse", flow: "registering invite rewards", cwe: "CWE-799", cvss: 8.0 },
  { sub: "Virtual Machine Allocation Scripting", flow: "provising compute resources", cwe: "CWE-799", cvss: 8.5 },
  { sub: "Document Scraping Loop", flow: "crawling private files", cwe: "CWE-799", cvss: 6.9 },
  { sub: "SMS API Billing Drain", flow: "invoking notification routes", cwe: "CWE-799", cvss: 8.3 },
  { sub: "License Key Verification Guessing", flow: "submitting license authentication attempts", cwe: "CWE-799", cvss: 7.8 },
  { sub: "Physical Resource Booking Abuse", flow: "reserving meeting assets", cwe: "CWE-799", cvss: 7.0 },
  { sub: "Project Dashboard Creation Loops", flow: "creating team workspaces", cwe: "CWE-799", cvss: 6.3 },
  { sub: "SaaS Tenant Initialization Flooding", flow: "initializing sandbox staging spaces", cwe: "CWE-799", cvss: 7.9 },
  { sub: "Email Notification Abuse Flow", flow: "triggering sign up newsletters", cwe: "CWE-799", cvss: 7.3 },
  { sub: "OTP Passcode Guessing Attacks", flow: "entering security check PIN codes", cwe: "CWE-287", cvss: 8.8 },
  { sub: "Virtual Machine Console Connection Port Exhaustion", flow: "creating VM console endpoints connections", cwe: "CWE-400", cvss: 7.7 },
  { sub: "Billing Rate Audit Log Spamming", flow: "checking billing histories", cwe: "CWE-799", cvss: 5.8 },
  { sub: "Physical Calendar Event Scraping Loop", flow: "extracting booking schedules details", cwe: "CWE-799", cvss: 6.2 },
  { sub: "Project File Attachment Loop Uploads", flow: "sending attachments", cwe: "CWE-799", cvss: 6.7 },
  { sub: "Feedback DB Write Starvation Attack", flow: "inserting customer reports", cwe: "CWE-799", cvss: 6.5 },
  { sub: "SMS Provider API Callback Spoofing", flow: "sending simulated SMS status notifications", cwe: "CWE-345", cvss: 8.2 },
  { sub: "Referral Rewards Balance Exploits", flow: "redeeming promotional discounts balance", cwe: "CWE-799", cvss: 8.4 },
  { sub: "Tenant Domain Checking Loops", flow: "searching for staging subdomain configurations", cwe: "CWE-799", cvss: 6.1 },
  { sub: "Compute Node Command Run Request Floods", flow: "triggering internal VM diagnostic scripts", cwe: "CWE-799", cvss: 8.6 },
  { sub: "Document PDF Render Storage Abuse", flow: "generating high counts of offline user reports", cwe: "CWE-799", cvss: 7.6 },
  { sub: "SAML Metadata Update Triggers", flow: "uploading enterprise authentication federation configs", cwe: "CWE-306", cvss: 8.7 },
  { sub: "Physical Meeting Asset Booking Clashes", flow: "submitting double reservation payloads", cwe: "CWE-799", cvss: 6.4 },
  { sub: "Audit Logging Export File Loops", flow: "generating audit CSV documents", cwe: "CWE-799", cvss: 7.1 },
  { sub: "SMS Auth Gateway Spam runs", flow: "requesting multi-factor phone OTP codes", cwe: "CWE-799", cvss: 8.0 },
  { sub: "VM Node Memory Allocation abuse", flow: "triggering database query logs analysis tasks", cwe: "CWE-799", cvss: 7.9 },
  { sub: "Tenant Database Schema Reset Abuse", flow: "requesting tenant DB purge triggers", cwe: "CWE-306", cvss: 9.0 }
];

uasbfTemplates.forEach((t, i) => {
  const code = `UASBF_${t.sub.toUpperCase().replace(/[\s-]/g, "_")}`;
  UASBF.push({
    key: code,
    severity: t.cvss >= 9.0 ? "critical" : (t.cvss >= 7.0 ? "high" : "medium"),
    cvss: t.cvss,
    title: t.sub,
    description: `An attacker can exploit the business logic of ${t.flow} by scripting automated calls without rate limit validation or behavioral checks.`,
    recommendation: `Implement rate limits, client-reputation checks, behavioral heuristics, CAPTCHAs, and workflow tracking.`,
    cwe: t.cwe,
    owasp: "API6:2023 Unrestricted Access to Sensitive Business Flows",
    category: "Unrestricted Access to Sensitive Business Flows",
    references: ["https://owasp.org/API-Security/editions/2023/en/0x16-t10-unrestricted-access-to-sensitive-business-flows/"],
    remediationSteps: [
      `Enforce behavioral profiling and detect automated bots.`,
      `Enforce secondary identity verification steps for critical actions.`,
      `Track flow progression using state tokens to prevent request skips.`
    ]
  });
});

// 7. SSRF (Server-Side Request Forgery) - 32 items
const ssrfTemplates = [
  { sub: "SSRF in Webhook Subscriptions", param: "url", cwe: "CWE-918", cvss: 8.6 },
  { sub: "SSRF in Avatar Image Loader", param: "avatarUrl", cwe: "CWE-918", cvss: 7.2 },
  { sub: "SSRF in PDF Convert Tool", param: "sourceUrl", cwe: "CWE-918", cvss: 8.1 },
  { sub: "SSRF in File Upload API", param: "fileUrl", cwe: "CWE-918", cvss: 7.8 },
  { sub: "SSRF in Integrations Setup", param: "webhookUrl", cwe: "CWE-918", cvss: 8.3 },
  { sub: "SSRF in SMS Gateway Custom Router", param: "gatewayEndpoint", cwe: "CWE-918", cvss: 8.5 },
  { sub: "SSRF in Virtual Machine Deployment", param: "imageUrl", cwe: "CWE-918", cvss: 9.0 },
  { sub: "SSRF in Audit Trace Collector", param: "loggerUrl", cwe: "CWE-918", cvss: 7.4 },
  { sub: "SSRF in Physical Calendar Feed", param: "feedUrl", cwe: "CWE-918", cvss: 6.9 },
  { sub: "SSRF in Project Collaboration Board API", param: "logoUrl", cwe: "CWE-918", cvss: 7.0 },
  { sub: "SSRF in SaaS Workspace Settings", param: "customCssUrl", cwe: "CWE-918", cvss: 7.3 },
  { sub: "SSRF in License Validation Tool", param: "verificationServer", cwe: "CWE-918", cvss: 8.0 },
  { sub: "SSRF in Feedback Ticket Attachments API", param: "attachmentUrl", cwe: "CWE-918", cvss: 6.5 },
  { sub: "SSRF in Referral Program Analytics API", param: "trackingPixelUrl", cwe: "CWE-918", cvss: 6.0 },
  { sub: "SSRF in Billing Reports Export Service", param: "callbackUrl", cwe: "CWE-918", cvss: 7.9 },
  { sub: "SSRF in Compute Node Diagnostic Agent", param: "targetHost", cwe: "CWE-918", cvss: 8.8 },
  { sub: "SSRF in Tenant Schema Provision Tool", param: "templateUrl", cwe: "CWE-918", cvss: 8.4 },
  { sub: "SSRF in User Profile Banner Image Upload", param: "bannerUrl", cwe: "CWE-918", cvss: 7.1 },
  { sub: "SSRF in SAML Federation Endpoint Setup", param: "metadataUrl", cwe: "CWE-918", cvss: 9.3 },
  { sub: "SSRF in physical location mapping service", param: "mapUrl", cwe: "CWE-918", cvss: 6.7 },
  { sub: "SSRF in project attachment archive creator", param: "exportUrl", cwe: "CWE-918", cvss: 7.5 },
  { sub: "SSRF in feedback widget remote configs", param: "widgetConfigUrl", cwe: "CWE-918", cvss: 6.8 },
  { sub: "SSRF in SMS campaign notification templates API", param: "templateUrl", cwe: "CWE-918", cvss: 8.2 },
  { sub: "SSRF in referral invite tracking links validator", param: "verifyUrl", cwe: "CWE-918", cvss: 7.6 },
  { sub: "SSRF in SaaS tenant onboarding setup", param: "logoUrl", cwe: "CWE-918", cvss: 7.7 },
  { sub: "SSRF in document export parser", param: "parserEndpoint", cwe: "CWE-918", cvss: 8.0 },
  { sub: "SSRF in VM metric aggregation broker", param: "brokerUrl", cwe: "CWE-918", cvss: 8.7 },
  { sub: "SSRF in billing PDF convert engine", param: "convertEndpoint", cwe: "CWE-918", cvss: 8.2 },
  { sub: "SSRF in SMS service callback validation hook", param: "callbackUrl", cwe: "CWE-918", cvss: 8.5 },
  { sub: "SSRF in referral payout token lookup tool", param: "lookupUrl", cwe: "CWE-918", cvss: 7.0 },
  { sub: "SSRF in physical calendar syncing proxy", param: "syncEndpoint", cwe: "CWE-918", cvss: 6.4 },
  { sub: "SSRF in multi-tenant resource inventory broker", param: "inventoryEndpoint", cwe: "CWE-918", cvss: 8.9 }
];

ssrfTemplates.forEach((t, i) => {
  const code = `SSRF_${t.sub.toUpperCase().replace(/[\s-]/g, "_")}`;
  SSRF.push({
    key: code,
    severity: t.cvss >= 9.0 ? "critical" : (t.cvss >= 7.0 ? "high" : "medium"),
    cvss: t.cvss,
    title: t.sub,
    description: `The application retrieves content from user-controlled URLs defined in "${t.param}" parameters without restricting access to local network blocks or cloud metadata endpoints.`,
    recommendation: `Enforce a strict whitelist for permitted destination domains. Resolve target URLs to IP addresses and verify they do not point to private address ranges.`,
    cwe: t.cwe,
    owasp: "API7:2023 Server Side Request Forgery",
    category: "Server Side Request Forgery",
    references: ["https://owasp.org/API-Security/editions/2023/en/0x17-t10-server-side-request-forgery/"],
    remediationSteps: [
      `Enforce domain-based whitelisting on outbound HTTP requests.`,
      `Disable redirection support on HTTP request clients.`,
      `Configure firewalls to block outbound requests from application servers to cloud metadata IP addresses (e.g. 169.254.169.254).`
    ]
  });
});

// 8. SM (Security Misconfiguration) - 32 items
const smTemplates = [
  { sub: "Verbose Stack Traces Exposed", desc: "Reveals detailed server framework exceptions and system structures.", cwe: "CWE-209", cvss: 5.3, owasp: "A05:2021 Security Misconfiguration" },
  { sub: "Default Admin Logins Present", desc: "Standard installations keep default authentication profiles active.", cwe: "CWE-1393", cvss: 9.8, owasp: "A05:2021 Security Misconfiguration" },
  { sub: "Debug Mode Active in Production", desc: "Allows administrative inspect setups and query consoles to run publicly.", cwe: "CWE-489", cvss: 8.5, owasp: "A05:2021 Security Misconfiguration" },
  { sub: "Directory Indexing Enabled", desc: "Exposes files on web server paths that lack index files.", cwe: "CWE-548", cvss: 5.0, owasp: "A05:2021 Security Misconfiguration" },
  { sub: "HTTP Security Headers Missing", desc: "Lacks crucial browser clickjacking and content type mitigation tags.", cwe: "CWE-693", cvss: 4.8, owasp: "A05:2021 Security Misconfiguration" },
  { sub: "Wildcard CORS Policy Set", desc: "Exposes endpoints dynamically to request scripts from all source origins.", cwe: "CWE-942", cvss: 6.2, owasp: "A05:2021 Security Misconfiguration" },
  { sub: "Weak SSL/TLS Protocols Configured", desc: "Allows connections using TLS 1.0 or 1.1 protocol suites.", cwe: "CWE-326", cvss: 6.8, owasp: "A02:2021 Cryptographic Failures" },
  { sub: "Expired SSL/TLS Certificate Present", desc: "Uses SSL certifications that are expired or invalid.", cwe: "CWE-295", cvss: 7.1, owasp: "A02:2021 Cryptographic Failures" },
  { sub: "HTTP TRACE Method Activated", desc: "Enables request headers reflecting, opening cross-site tracing vectors.", cwe: "CWE-200", cvss: 4.3, owasp: "A05:2021 Security Misconfiguration" },
  { sub: "Server Software Disclosure in Headers", desc: "Discloses exact operating system and server framework versions.", cwe: "CWE-200", cvss: 3.5, owasp: "A05:2021 Security Misconfiguration" },
  { sub: "Unencrypted Database Backups Storage", desc: "Backup archives stored on public storage buckets without encryption.", cwe: "CWE-311", cvss: 9.1, owasp: "A02:2021 Cryptographic Failures" },
  { sub: "Unused Ports Active on Host", desc: "Services like SSH or Redis bind and run on public networking ports.", cwe: "CWE-668", cvss: 7.9, owasp: "A05:2021 Security Misconfiguration" },
  { sub: "XML External Entity Processing Allowed", desc: "Parses XML parameters allowing local resource inclusion.", cwe: "CWE-611", cvss: 8.8, owasp: "A05:2021 Security Misconfiguration" },
  { sub: "Missing SameSite Attribute on Cookies", desc: "Cookie configs omit SameSite, allowing Cross-Site Request Forgery.", cwe: "CWE-1275", cvss: 5.8, owasp: "A01:2021 Broken Access Control" },
  { sub: "Insecure Transport Allowed", desc: "Permits HTTP authentication connections without redirecting to HTTPS.", cwe: "CWE-319", cvss: 8.0, owasp: "A02:2021 Cryptographic Failures" },
  { sub: "Self-Signed Certificate Trust Setup", desc: "Accepts self-signed certificates in third-party integrations.", cwe: "CWE-295", cvss: 7.4, owasp: "A02:2021 Cryptographic Failures" },
  { sub: "CORS Credentials Allowed with Wildcard", desc: "Allows credentials parameter mapping with wildcard origin policies.", cwe: "CWE-942", cvss: 8.2, owasp: "A05:2021 Security Misconfiguration" },
  { sub: "PHP Info Script Publicly Exposed", desc: "Exposes system paths, configuration limits, and framework properties.", cwe: "CWE-200", cvss: 5.3, owasp: "A05:2021 Security Misconfiguration" },
  { sub: "Docker Socket File Exposure", desc: "Mounts internal docker.sock files, permitting host container breakouts.", cwe: "CWE-732", cvss: 9.4, owasp: "A05:2021 Security Misconfiguration" },
  { sub: "Kubernetes Dashboard Access Public", desc: "Exposes cluster administration dashboards without password check setups.", cwe: "CWE-306", cvss: 9.6, owasp: "A05:2021 Security Misconfiguration" },
  { sub: "AWS S3 Bucket Permissions Set to Public", desc: "Enables public indexing on bucket storage directories.", cwe: "CWE-732", cvss: 8.3, owasp: "A05:2021 Security Misconfiguration" },
  { sub: "Database Error Details Publicly Exposed", desc: "Exposes detailed query faults and database metadata schemas.", cwe: "CWE-209", cvss: 5.7, owasp: "A05:2021 Security Misconfiguration" },
  { sub: "Weak HSTS Max-Age Value", desc: "Strict-Transport-Security duration configured below 1 year.", cwe: "CWE-523", cvss: 4.0, owasp: "A05:2021 Security Misconfiguration" },
  { sub: "Missing Secure Flag on Sensitive Cookies", desc: "Cookies with session tokens transmitted over cleartext HTTP lines.", cwe: "CWE-614", cvss: 7.5, owasp: "A02:2021 Cryptographic Failures" },
  { sub: "Missing HttpOnly Flag on Session Cookies", desc: "Permits client side JavaScript to access session cookie objects.", cwe: "CWE-1004", cvss: 7.2, owasp: "A05:2021 Security Misconfiguration" },
  { sub: "SMTP Server Relaying Enabled", desc: "Mail server parameters permit routing messages from unverified sources.", cwe: "CWE-269", cvss: 6.8, owasp: "A05:2021 Security Misconfiguration" },
  { sub: "X-Frame-Options Header Omitted", desc: "Fails to enforce frame nesting policies, opening clickjacking vectors.", cwe: "CWE-1021", cvss: 4.7, owasp: "A05:2021 Security Misconfiguration" },
  { sub: "Referrer-Policy Header Omitted", desc: "Fails to configure header parameters, leaking navigation history.", cwe: "CWE-200", cvss: 3.8, owasp: "A01:2021 Broken Access Control" },
  { sub: "Insecure Cipher Suites Configured", desc: "Enables RC4 or DES encryption algorithms.", cwe: "CWE-327", cvss: 6.5, owasp: "A02:2021 Cryptographic Failures" },
  { sub: "Default Database Access Ports Public", desc: "Database servers (MySQL, MongoDB) bind to public interfaces.", cwe: "CWE-668", cvss: 8.7, owasp: "A05:2021 Security Misconfiguration" },
  { sub: "DNS Zone Transfer Allowed", desc: "Permits general zone query transfers, leaking subnet topologies.", cwe: "CWE-200", cvss: 5.1, owasp: "A05:2021 Security Misconfiguration" },
  { sub: "HSTS Subdomains Flag Missing", desc: "Fails to enforce security parameters on active host subdomains.", cwe: "CWE-523", cvss: 4.2, owasp: "A05:2021 Security Misconfiguration" }
];

smTemplates.forEach((t, i) => {
  const code = `SM_${t.sub.toUpperCase().replace(/[\s-]/g, "_")}`;
  SM.push({
    key: code,
    severity: t.cvss >= 9.0 ? "critical" : (t.cvss >= 7.0 ? "high" : "medium"),
    cvss: t.cvss,
    title: t.sub,
    description: t.desc,
    recommendation: `Update server configuration parameters to harden the environment and disable insecure features.`,
    cwe: t.cwe,
    owasp: t.owasp,
    category: "Security Misconfiguration",
    references: ["https://owasp.org/www-project-top-ten/2021/A05_2021-Security_Misconfiguration/"],
    remediationSteps: [
      `Disable unnecessary services and components.`,
      `Implement centralized security configuration management.`,
      `Review security configurations periodically.`
    ]
  });
});

// 9. INJ (Injection) - 32 items
const injTemplates = [
  { sub: "SQL Injection in User Search API", type: "SQL", cwe: "CWE-89", cvss: 9.3 },
  { sub: "SQL Injection in Order Sorting Param", type: "SQL", cwe: "CWE-89", cvss: 8.8 },
  { sub: "SQL Injection in Billing Rate Update Query", type: "SQL", cwe: "CWE-89", cvss: 9.1 },
  { sub: "SQL Injection in Document Filters", type: "SQL", cwe: "CWE-89", cvss: 8.5 },
  { sub: "SQL Injection in Feedback Review Feed", type: "SQL", cwe: "CWE-89", cvss: 7.9 },
  { sub: "NoSQL Injection in Auth Authentication", type: "NoSQL", cwe: "CWE-943", cvss: 9.8 },
  { sub: "NoSQL Injection in Project Query Payload", type: "NoSQL", cwe: "CWE-943", cvss: 8.2 },
  { sub: "NoSQL Injection in SMS Verification Code Search", type: "NoSQL", cwe: "CWE-943", cvss: 8.0 },
  { sub: "NoSQL Injection in Audit Log Filters", type: "NoSQL", cwe: "CWE-943", cvss: 7.5 },
  { sub: "NoSQL Injection in Referral Invite Registration", type: "NoSQL", cwe: "CWE-943", cvss: 7.8 },
  { sub: "OS Command Injection in PDF Renderer", type: "OS Command", cwe: "CWE-78", cvss: 9.8 },
  { sub: "OS Command Injection in Image Converter", type: "OS Command", cwe: "CWE-78", cvss: 9.5 },
  { sub: "OS Command Injection in Backup Compressor", type: "OS Command", cwe: "CWE-78", cvss: 9.4 },
  { sub: "OS Command Injection in License Decryption Agent", type: "OS Command", cwe: "CWE-78", cvss: 8.9 },
  { sub: "OS Command Injection in SMS Routing Network Tool", type: "OS Command", cwe: "CWE-78", cvss: 9.2 },
  { sub: "LDAP Injection in User Directory Integration", type: "LDAP", cwe: "CWE-90", cvss: 8.1 },
  { sub: "LDAP Injection in Admin Member Authorization Check", type: "LDAP", cwe: "CWE-90", cvss: 7.7 },
  { sub: "LDAP Injection in Org Workspaces Setup", type: "LDAP", cwe: "CWE-90", cvss: 7.3 },
  { sub: "LDAP Injection in Tenant Account Assignment API", type: "LDAP", cwe: "CWE-90", cvss: 8.0 },
  { sub: "LDAP Injection in Physical Resource Reservation Verification", type: "LDAP", cwe: "CWE-90", cvss: 7.1 },
  { sub: "XML Injection in SAML Parser Payload", type: "XML", cwe: "CWE-91", cvss: 8.4 },
  { sub: "XML Injection in Document Parsing Utility", type: "XML", cwe: "CWE-91", cvss: 7.0 },
  { sub: "XML Injection in Virtual Machine Import Settings", type: "XML", cwe: "CWE-91", cvss: 8.3 },
  { sub: "HTML Injection in Feedback Ticket Description", type: "HTML", cwe: "CWE-79", cvss: 6.2 },
  { sub: "HTML Injection in User Profile Nickname Parameter", type: "HTML", cwe: "CWE-79", cvss: 5.8 },
  { sub: "HTML Injection in Notification Dispatch Body", type: "HTML", cwe: "CWE-79", cvss: 6.5 },
  { sub: "HTML Injection in Project Collaboration Tasks", type: "HTML", cwe: "CWE-79", cvss: 5.5 },
  { sub: "Template Injection in Password Recovery Email Tool", type: "SSTI", cwe: "CWE-94", cvss: 8.7 },
  { sub: "Template Injection in SMS Promotional Message Generator", type: "SSTI", cwe: "CWE-94", cvss: 7.6 },
  { sub: "Template Injection in Billing Invoice PDF Generator", type: "SSTI", cwe: "CWE-94", cvss: 8.3 },
  { sub: "Template Injection in Tenant Greeting Text Settings", type: "SSTI", cwe: "CWE-94", cvss: 8.0 },
  { sub: "Template Injection in Referral Reward Mail Template", type: "SSTI", cwe: "CWE-94", cvss: 7.4 }
];

injTemplates.forEach((t, i) => {
  const code = `INJ_${t.sub.toUpperCase().replace(/[\s-]/g, "_")}`;
  INJ.push({
    key: code,
    severity: t.cvss >= 9.0 ? "critical" : (t.cvss >= 7.0 ? "high" : "medium"),
    cvss: t.cvss,
    title: t.sub,
    description: `The application passes user-controlled parameters directly into ${t.type} interpreters without sanitization or parameter binding, allowing database manipulation or command executions.`,
    recommendation: `Enforce parameterized queries, bind parameters strictly, and sanitize all input values before processing.`,
    cwe: t.cwe,
    owasp: "A03:2021-Injection",
    category: "Injection",
    references: ["https://owasp.org/www-project-top-ten/2021/A03_2021-Injection/"],
    remediationSteps: [
      `Use object-relational mapping frameworks (ORMs) to sanitize inputs dynamically.`,
      `Sanitize text parameters against blocklisted patterns.`,
      `Run interpreters with restricted operating system privileges.`
    ]
  });
});

// 10. CRYPTO (Broken Cryptography & Key Management) - 32 items
const cryptoTemplates = [
  { sub: "Weak Password Encryption Algorithm MD5", algo: "MD5", cwe: "CWE-328", cvss: 8.7 },
  { sub: "Weak Verification Sign Algorithm SHA1", algo: "SHA1", cwe: "CWE-328", cvss: 7.2 },
  { sub: "Cleartext Storage of API Secrets", algo: "unencrypted variables", cwe: "CWE-312", cvss: 9.5 },
  { sub: "Cleartext Storage of Private SSH Keys", algo: "unencrypted file directories", cwe: "CWE-312", cvss: 9.3 },
  { sub: "Cleartext Storage of Credit Card Data", algo: "unencrypted tables", cwe: "CWE-312", cvss: 9.8 },
  { sub: "Cleartext Storage of Security Recovery Codes", algo: "unencrypted database records", cwe: "CWE-312", cvss: 9.0 },
  { sub: "Cleartext Storage of User Password Hashes", algo: "unencrypted field properties", cwe: "CWE-312", cvss: 9.1 },
  { sub: "Cleartext Storage of Session Identifiers", algo: "unencrypted log file lines", cwe: "CWE-312", cvss: 7.4 },
  { sub: "Cleartext Storage of License Auth Tokens", algo: "unencrypted setting parameters", cwe: "CWE-312", cvss: 7.8 },
  { sub: "Insecure Random Seed for Recover Keys", algo: "Math.random() generators", cwe: "CWE-330", cvss: 8.0 },
  { sub: "Insecure Random Seed for MFA Codes", algo: "timestamp-based generation", cwe: "CWE-330", cvss: 8.4 },
  { sub: "Insecure Random Seed for JWT Signature", algo: "static process environment indexes", cwe: "CWE-330", cvss: 8.2 },
  { sub: "Symmetric Encryption using Weak DES", algo: "DES", cwe: "CWE-327", cvss: 7.5 },
  { sub: "Symmetric Encryption using RC4 Stream", algo: "RC4", cwe: "CWE-327", cvss: 7.0 },
  { sub: "Symmetric Encryption using Blowfish Cipher", algo: "Blowfish", cwe: "CWE-327", cvss: 6.8 },
  { sub: "Insecure Transport Route Enabled HTTP", algo: "unencrypted ports", cwe: "CWE-319", cvss: 8.1 },
  { sub: "Database Connection Password in Cleartext", algo: "unencrypted connection strings", cwe: "CWE-522", cvss: 8.9 },
  { sub: "SMTP Credentials Stored in Cleartext", algo: "unencrypted properties files", cwe: "CWE-522", cvss: 8.3 },
  { sub: "SMS API Tokens Stored in Git History", algo: "exposed repository commits", cwe: "CWE-798", cvss: 9.2 },
  { sub: "Virtual Machine Secrets in User Metadata", algo: "exposed guest properties", cwe: "CWE-798", cvss: 8.6 },
  { sub: "License Server Public RSA Key Too Short", algo: "512-bit keys", cwe: "CWE-326", cvss: 7.1 },
  { sub: "SMS verification salt static in database", algo: "missing unique salts", cwe: "CWE-326", cvss: 6.9 },
  { sub: "Referral Campaign Secret Key Weak", algo: "easy-to-crack passphrases", cwe: "CWE-328", cvss: 6.0 },
  { sub: "Tenant Schema Master Salt Predictable", algo: "predictable string concatenation", cwe: "CWE-331", cvss: 7.6 },
  { sub: "Secure Cookies Transmitted Without Encryption", algo: "unencrypted paths", cwe: "CWE-319", cvss: 7.3 },
  { sub: "PDF converter encryption using weak AES-128-ECB", algo: "AES-128-ECB", cwe: "CWE-327", cvss: 7.7 },
  { sub: "Audit Logging encryption key hardcoded in engine", algo: "static keys", cwe: "CWE-798", cvss: 8.8 },
  { sub: "VM Node disk encryption key stored in local host files", algo: "unsecured disk paths", cwe: "CWE-312", cvss: 8.5 },
  { sub: "Document metadata validation key derived from timestamp", algo: "predictable generation keys", cwe: "CWE-331", cvss: 6.2 },
  { sub: "SMS Service JWT key containing no signature validation", algo: "missing verification keys", cwe: "CWE-347", cvss: 8.0 },
  { sub: "Referral payouts database table decrypted publicly", algo: "unencrypted table partitions", cwe: "CWE-311", cvss: 8.4 },
  { sub: "Physical Resource Schedule Token Predictable", algo: "sequential identity tokens", cwe: "CWE-330", cvss: 5.5 }
];

cryptoTemplates.forEach((t, i) => {
  const code = `CRYPTO_${t.sub.toUpperCase().replace(/[\s-]/g, "_")}`;
  CRYPTO.push({
    key: code,
    severity: t.cvss >= 9.0 ? "critical" : (t.cvss >= 7.0 ? "high" : "medium"),
    cvss: t.cvss,
    title: t.sub,
    description: `The application stores or processes sensitive information using weak cryptographic mechanisms or exposed secrets (${t.algo}), leaving data vulnerable to extraction.`,
    recommendation: `Implement industry-standard encryption algorithms and ensure secure key storage.`,
    cwe: t.cwe,
    owasp: "A02:2021-Cryptographic Failures",
    category: "Cryptographic Failures",
    references: ["https://owasp.org/www-project-top-ten/2021/A02_2021-Cryptographic_Failures/"],
    remediationSteps: [
      `Upgrade encryption configurations to standard algorithms like AES-256-GCM.`,
      `Use secure key management systems (KMS) or Vault servers.`,
      `Rotate database keys periodically.`
    ]
  });
});

// 11. WEB_OTHER (XSS, CSRF, etc.) - 32 items
const webOtherTemplates = [
  { sub: "Stored Cross-Site Scripting in Comments Feed", type: "XSS", cwe: "CWE-79", cvss: 8.2 },
  { sub: "Reflected Cross-Site Scripting in Error Parameter", type: "XSS", cwe: "CWE-79", cvss: 7.5 },
  { sub: "DOM-Based Cross-Site Scripting in Workspace Router", type: "XSS", cwe: "CWE-79", cvss: 7.2 },
  { sub: "Stored Cross-Site Scripting in Billing Account Nickname", type: "XSS", cwe: "CWE-79", cvss: 7.9 },
  { sub: "Stored Cross-Site Scripting in Virtual Machine Host Label", type: "XSS", cwe: "CWE-79", cvss: 8.0 },
  { sub: "Cross-Site Request Forgery in Password Update", type: "CSRF", cwe: "CWE-352", cvss: 8.8 },
  { sub: "Cross-Site Request Forgery in Email Change API", type: "CSRF", cwe: "CWE-352", cvss: 8.1 },
  { sub: "Cross-Site Request Forgery in Workspace Invalidate API", type: "CSRF", cwe: "CWE-352", cvss: 7.8 },
  { sub: "Cross-Site Request Forgery in SMS Routing Settings", type: "CSRF", cwe: "CWE-352", cvss: 7.4 },
  { sub: "Cross-Site Request Forgery in Referral Registration", type: "CSRF", cwe: "CWE-352", cvss: 6.8 },
  { sub: "Path Traversal in File Viewer Utility", type: "Path Traversal", cwe: "CWE-22", cvss: 8.5 },
  { sub: "Path Traversal in Report Template Loader", type: "Path Traversal", cwe: "CWE-22", cvss: 7.7 },
  { sub: "Path Traversal in VM Console Log Exporter", type: "Path Traversal", cwe: "CWE-22", cvss: 8.0 },
  { sub: "Path Traversal in Document Attachment Retrieval", type: "Path Traversal", cwe: "CWE-22", cvss: 7.9 },
  { sub: "Open Redirect in Login Success Handler", type: "Open Redirect", cwe: "CWE-601", cvss: 6.1 },
  { sub: "Open Redirect in Logout Redirect Parameter", type: "Open Redirect", cwe: "CWE-601", cvss: 5.8 },
  { sub: "Open Redirect in SMS verification callback links", type: "Open Redirect", cwe: "CWE-601", cvss: 7.0 },
  { sub: "Open Redirect in Referral promotional landing links", type: "Open Redirect", cwe: "CWE-601", cvss: 6.7 },
  { sub: "Clickjacking Vulnerability in User Profile Page", type: "Clickjacking", cwe: "CWE-1021", cvss: 4.8 },
  { sub: "Clickjacking Vulnerability in Billing Dashboard", type: "Clickjacking", cwe: "CWE-1021", cvss: 5.3 },
  { sub: "Clickjacking Vulnerability in Physical Resource Booking Calendar", type: "Clickjacking", cwe: "CWE-1021", cvss: 4.2 },
  { sub: "Clickjacking Vulnerability in Tenant Settings Workspace", type: "Clickjacking", cwe: "CWE-1021", cvss: 4.5 },
  { sub: "CORS Misconfiguration Origin Reflection", type: "CORS Reflection", cwe: "CWE-942", cvss: 7.3 },
  { sub: "Insecure Deserialization in Session Object Parser", type: "Deserialization", cwe: "CWE-502", cvss: 9.8 },
  { sub: "Insecure Deserialization in Document Configuration Import", type: "Deserialization", cwe: "CWE-502", cvss: 8.9 },
  { sub: "Insecure Deserialization in VM Settings Template Parser", type: "Deserialization", cwe: "CWE-502", cvss: 9.1 },
  { sub: "Server-Side Template Injection in Feedback Autoresponder", type: "SSTI", cwe: "CWE-94", cvss: 8.6 },
  { sub: "Server-Side Template Injection in Organization Alert Dispatch", type: "SSTI", cwe: "CWE-94", cvss: 8.3 },
  { sub: "HTML Injection in Coupon Campaign description", type: "HTML Injection", cwe: "CWE-79", cvss: 5.1 },
  { sub: "Stored Cross-Site Scripting in Tenant Contact details", type: "XSS", cwe: "CWE-79", cvss: 8.4 },
  { sub: "Stored Cross-Site Scripting in Audit Logging alert rules", type: "XSS", cwe: "CWE-79", cvss: 7.1 },
  { sub: "Cross-Site Request Forgery in DB backup execution triggers", type: "CSRF", cwe: "CWE-352", cvss: 9.0 }
];

webOtherTemplates.forEach((t, i) => {
  const code = `WEB_${t.sub.toUpperCase().replace(/[\s-]/g, "_")}`;
  webOtherTemplates.push({
    key: code,
    severity: t.cvss >= 9.0 ? "critical" : (t.cvss >= 7.0 ? "high" : "medium"),
    cvss: t.cvss,
    title: t.sub,
    description: `The application fails to protect against ${t.type} vulnerabilities, allowing attackers to execute scripts, trigger actions, or read local files.`,
    recommendation: `Implement proper escaping, anti-CSRF tokens, input validation, and secure HTTP response headers.`,
    cwe: t.cwe,
    owasp: "A01:2021-Broken Access Control",
    category: "Web Vulnerabilities",
    references: ["https://owasp.org"],
    remediationSteps: [
      `Enforce context-aware output encoding to prevent script injection.`,
      `Add random, cryptographically secure anti-CSRF token verification checks.`,
      `Enforce a restrictive Content Security Policy (CSP).`
    ]
  });
});

// Consolidate all generated vulnerabilities
const allVulnerabilities = {};

const addCatalog = (list) => {
  list.forEach((v) => {
    if (v.key) {
      allVulnerabilities[v.key] = {
        severity: v.severity,
        cvss: v.cvss,
        title: v.title,
        description: v.description,
        recommendation: v.recommendation,
        cwe: v.cwe,
        owasp: v.owasp,
        category: v.category,
        references: v.references,
        remediationSteps: v.remediationSteps
      };
    }
  });
};

addCatalog(BOLA);
addCatalog(BUA);
addCatalog(BOPLA);
addCatalog(URC);
addCatalog(BFLA);
addCatalog(UASBF);
addCatalog(SSRF);
addCatalog(SM);
addCatalog(INJ);
addCatalog(CRYPTO);
// Filter out helper templates from webOther list
addCatalog(webOtherTemplates.filter(t => t.key));

// Output to the vulnerability.catalog.js format
const fileContent = `const DEFAULT_METADATA = {
  cvss: 5.0,
  category: "Security Misconfiguration",
  references: ["https://owasp.org"],
  remediationSteps: [
    "Review security configuration",
    "Apply recommended remediation",
    "Re-scan after implementation",
  ],
};

const VULNERABILITIES = ${JSON.stringify(allVulnerabilities, null, 2)};

module.exports = {
  VULNERABILITIES,
  DEFAULT_METADATA,
};
`;

fs.writeFileSync(
  path.join(__dirname, "..", "backend", "src", "modules", "vulnerabilities", "vulnerability.catalog.js"),
  fileContent
);

console.log("Vulnerability catalog successfully written with " + Object.keys(allVulnerabilities).length + " items!");
