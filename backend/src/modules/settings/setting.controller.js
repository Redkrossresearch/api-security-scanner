const Setting = require("./setting.model");
const axios = require("axios");

const getSettings = async (req, res) => {
  try {
    const userId = req.user?._id; // Extracted by auth middleware
    let settings = await Setting.findOne({ userId });

    if (!settings) {
      // Create default settings if none exists
      settings = await Setting.create({
        userId,
        targetHeaders: [],
        authType: "none",
        authToken: "",
        cronSchedule: "disabled",
        slackWebhook: "",
        jiraWebhook: "",
        discordWebhook: "",
        customSystemPrompt: "",
      });
    }

    res.json({
      success: true,
      settings,
    });
  } catch (error) {
    res.status(550).json({
      success: false,
      message: error.message,
    });
  }
};

const updateSettings = async (req, res) => {
  try {
    const userId = req.user?._id;
    const updateData = req.body;

    let settings = await Setting.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: "Settings updated successfully",
      settings,
    });
  } catch (error) {
    res.status(550).json({
      success: false,
      message: error.message,
    });
  }
};

const syncGithubWorkflow = async (req, res) => {
  try {
    const userId = req.user?._id;
    const settings = await Setting.findOne({ userId });

    if (!settings || !settings.githubToken || !settings.githubRepo) {
      return res.status(400).json({
        success: false,
        message: "GitHub integration is not fully configured.",
      });
    }

    if (settings.githubToken === "MOCK_TOKEN") {
      return res.json({
        success: true,
        message: "GitHub Actions workflow synchronized successfully! (Mock Simulation)",
        commit: `https://github.com/${settings.githubRepo}/commit/mock-sync-${Date.now().toString().slice(-6)}`
      });
    }

    const { githubToken, githubRepo, githubBranch } = settings;
    const origin = req.headers.origin || "http://localhost:5173";

    // Obtain the user integration security token
    const tokenPayload = {
      id: userId,
      email: req.user?.email,
      role: req.user?.role,
    };
    const jwt = require("jsonwebtoken");
    const integrationToken = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: "365d" });

    // Path in the user repository
    const url = `https://api.github.com/repos/${githubRepo}/contents/.github/workflows/athx-security-scan.yml`;

    const yamlContent = `name: ATHX Security Gate
on: [push, pull_request]

jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Security Audit
        run: |
          # 1. Trigger the Scan against your target endpoint
          res=$(curl -s -X POST "${origin}/api/scans" \\
            -H "Authorization: Bearer ${integrationToken}" \\
            -H "Content-Type: application/json" \\
            -d '{"targetUrl": "YOUR_STAGING_API_URL"}')
          
          scanId=$(echo $res | grep -oP '"_id":"\\K[^"]+')
          echo "ATHX Scan Initialized: $scanId"
          
          # 2. Poll Status until completed or failed
          while true; do
            status_res=$(curl -s "${origin}/api/scans/$scanId/status" \\
              -H "Authorization: Bearer ${integrationToken}")
            status=\$(echo \$status_res | grep -oP '"status":"\\K[^"]+')
            echo "Current Status: \$status"
            if [ "\$status" = "completed" ]; then break; fi
            if [ "\$status" = "failed" ]; then echo "Scan execution failed"; exit 1; fi
            sleep 10
          done
          
          # 3. Read vulnerability counts
          report=\$(curl -s "${origin}/api/scans/\$scanId" \\
            -H "Authorization: Bearer ${integrationToken}")
          critical=\$(echo \$report | grep -oP '"criticalCount":\\K[0-9]+')
          high=\$(echo \$report | grep -oP '"highCount":\\K[0-9]+')
          
          echo "Scan finished with \$critical Critical and \$high High findings."
          if [ "\$critical" -gt 0 ] || [ "\$high" -gt 0 ]; then
            echo "ATHX Security Gate: FAILED (High/Critical vulnerabilities detected!)"
            exit 1
          fi
          echo "ATHX Security Gate: PASSED"`;

    const base64Content = Buffer.from(yamlContent).toString("base64");

    const headers = {
      Authorization: `token ${githubToken}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "ATHX-Security-Scanner/1.0",
    };

    let sha = null;
    try {
      const getRes = await axios.get(url, { headers, params: { ref: githubBranch } });
      if (getRes.data && getRes.data.sha) {
        sha = getRes.data.sha;
      }
    } catch (e) {
      // Ignore if file doesn't exist
    }

    const payload = {
      message: "ci: configure ATHX Security Gate workflow",
      content: base64Content,
      branch: githubBranch,
    };
    if (sha) {
      payload.sha = sha;
    }

    const putRes = await axios.put(url, payload, { headers });

    res.json({
      success: true,
      message: "GitHub Actions workflow synchronized successfully!",
      commit: putRes.data?.commit?.html_url || "",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.response?.data?.message || error.message,
    });
  }
};

const getGithubClientId = async (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId || clientId === "PLACEHOLDER_CLIENT_ID" || clientId === "Ov23livi45903bda35fc") {
    const protocol = req.headers["x-forwarded-proto"] || req.protocol;
    const baseUrl = `${protocol}://${req.get("host")}/api`;
    return res.json({
      success: true,
      clientId: "MOCK_CLIENT_ID",
      mockAuthUrl: `${baseUrl}/settings/github/mock-authorize`
    });
  }
  res.json({
    success: true,
    clientId
  });
};

const renderMockAuthorize = (req, res) => {
  const { redirect_uri } = req.query;
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Authorize ATHX Scanner</title>
      <style>
        body {
          background-color: #0d1117;
          color: #c9d1d9;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          margin: 0;
        }
        .container {
          background: #161b22;
          border: 1px solid #30363d;
          border-radius: 12px;
          width: 440px;
          padding: 32px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.5);
        }
        .header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding-bottom: 16px;
          border-bottom: 1px solid #21262d;
          margin-bottom: 20px;
        }
        .flow {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 24px;
          margin: 24px 0;
        }
        .circle {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #21262d;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }
        .shield {
          background: rgba(56, 189, 248, 0.1);
          border: 1.5px solid #38BDF8;
          color: #38BDF8;
          font-weight: bold;
        }
        .arrow {
          color: #8b949e;
          font-size: 24px;
        }
        h2 {
          font-size: 20px;
          font-weight: 600;
          color: #FFF;
          margin: 0 0 10px 0;
          text-align: center;
        }
        p {
          font-size: 14px;
          line-height: 1.5;
          color: #8b949e;
          text-align: center;
          margin: 0 0 20px 0;
        }
        .scope-card {
          background: #0d1117;
          border: 1px solid #21262d;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 24px;
        }
        .scope-title {
          font-size: 11px;
          color: #8b949e;
          font-weight: 600;
          text-transform: uppercase;
          display: block;
          margin-bottom: 8px;
        }
        ul {
          margin: 0;
          padding-left: 20px;
          font-size: 13px;
          line-height: 1.6;
          color: #c9d1d9;
        }
        .btn-auth {
          background: #238636;
          color: #FFF;
          border: 1px solid rgba(240,246,252,0.1);
          border-radius: 6px;
          padding: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          width: 100%;
          text-align: center;
          transition: background 0.2s;
          outline: none;
        }
        .btn-auth:hover {
          background: #2ea043;
        }
        .btn-cancel {
          background: transparent;
          color: #f85149;
          border: none;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          width: 100%;
          padding: 8px;
          margin-top: 10px;
          text-align: center;
          text-decoration: none;
          display: block;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <svg height="24" viewBox="0 0 16 16" width="24" fill="#c9d1d9">
            <path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
          <span style="font-size: 16px; font-weight: 600; color: #FFF;">Authorize ATHX Scanner</span>
        </div>
        
        <div class="flow">
          <div class="circle">🐱</div>
          <div class="arrow">⇄</div>
          <div class="circle shield">🛡️</div>
        </div>

        <h2>Authorize ATHX Scanner</h2>
        <p><strong>ATHX Scanner</strong> wishes to authorize connection to your GitHub account to access your repositories.</p>

        <div class="scope-card">
          <span class="scope-title">Requested Access:</span>
          <ul>
            <li>Read/write actions workflow configurations (<code>workflow</code> scope)</li>
            <li>List public and private repositories (<code>repo</code> scope)</li>
          </ul>
        </div>

        <button class="btn-auth" onclick="if (window.opener) { window.opener.postMessage({ type: 'GITHUB_OAUTH_SUCCESS', code: 'MOCK_GITHUB_CODE' }, '*'); }; window.close();">Authorize Atharv-design</button>
        <a class="btn-cancel" href="#" onclick="window.close()">Cancel</a>
      </div>
    </body>
    </html>
  `);
};

const handleGithubCallback = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user?._id;

    if (code === "MOCK_GITHUB_CODE") {
      let settings = await Setting.findOne({ userId });
      if (!settings) {
        settings = await Setting.create({ userId });
      }
      settings.githubToken = "MOCK_TOKEN";
      await settings.save();
      return res.json({
        success: true,
        message: "Successfully authorized Mock GitHub account!"
      });
    }

    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return res.status(400).json({
        success: false,
        message: "GitHub OAuth app credentials are not configured in the server's .env file. Please add GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET."
      });
    }

    const tokenRes = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: clientId,
        client_secret: clientSecret,
        code
      },
      {
        headers: {
          Accept: "application/json"
        }
      }
    );

    const githubToken = tokenRes.data?.access_token;
    if (!githubToken) {
      return res.status(400).json({
        success: false,
        message: tokenRes.data?.error_description || "Failed to exchange OAuth code for token."
      });
    }

    let settings = await Setting.findOne({ userId });
    if (!settings) {
      settings = await Setting.create({ userId });
    }
    settings.githubToken = githubToken;
    await settings.save();

    res.json({
      success: true,
      message: "Successfully authorized GitHub account!"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getGithubRepos = async (req, res) => {
  try {
    const userId = req.user?._id;
    const settings = await Setting.findOne({ userId });

    if (!settings || !settings.githubToken) {
      return res.status(400).json({
        success: false,
        message: "GitHub integration is not connected."
      });
    }

    if (settings.githubToken === "MOCK_TOKEN") {
      const mockRepos = [
        { fullName: "atharv-design/api-security-scanner", private: true, defaultBranch: "dev" },
        { fullName: "atharv-design/payment-gateway", private: true, defaultBranch: "main" },
        { fullName: "atharv-design/node-express-backend", private: false, defaultBranch: "main" },
        { fullName: "atharv-design/react-dashboard-ui", private: false, defaultBranch: "master" },
        { fullName: "atharv-design/user-auth-service", private: true, defaultBranch: "main" }
      ];
      return res.json({
        success: true,
        repos: mockRepos
      });
    }

    const reposRes = await axios.get("https://api.github.com/user/repos", {
      headers: {
        Authorization: `token ${settings.githubToken}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "ATHX-Security-Scanner/1.0"
      },
      params: {
        per_page: 100,
        sort: "updated"
      }
    });

    const repos = reposRes.data.map(repo => ({
      name: repo.name,
      fullName: repo.full_name,
      private: repo.private,
      defaultBranch: repo.default_branch
    }));

    res.json({
      success: true,
      repos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.response?.data?.message || error.message
    });
  }
};

const disconnectGithub = async (req, res) => {
  try {
    const userId = req.user?._id;
    const settings = await Setting.findOne({ userId });
    if (settings) {
      settings.githubToken = "";
      settings.githubRepo = "";
      await settings.save();
    }
    res.json({
      success: true,
      message: "GitHub integration disconnected successfully."
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getGithubBranches = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { repo } = req.query;

    if (!repo) {
      return res.status(400).json({
        success: false,
        message: "Repository parameter is required."
      });
    }

    const settings = await Setting.findOne({ userId });
    if (!settings || !settings.githubToken) {
      return res.status(400).json({
        success: false,
        message: "GitHub integration is not connected."
      });
    }

    if (settings.githubToken === "MOCK_TOKEN") {
      const mockBranches = {
        "atharv-design/api-security-scanner": ["dev", "main", "feature/waf"],
        "atharv-design/payment-gateway": ["main", "staging", "hotfix"],
        "atharv-design/node-express-backend": ["main", "development"],
        "atharv-design/react-dashboard-ui": ["master", "v2-release"],
        "atharv-design/user-auth-service": ["main", "refactor"]
      };
      const branches = (mockBranches[repo] || ["main"]).map(name => ({ name }));
      return res.json({
        success: true,
        branches
      });
    }

    const branchesRes = await axios.get(`https://api.github.com/repos/${repo}/branches`, {
      headers: {
        Authorization: `token ${settings.githubToken}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "ATHX-Security-Scanner/1.0"
      },
      params: {
        per_page: 100
      }
    });

    const branches = branchesRes.data.map(b => ({
      name: b.name
    }));

    res.json({
      success: true,
      branches
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.response?.data?.message || error.message
    });
  }
};

module.exports = {
  getSettings,
  updateSettings,
  syncGithubWorkflow,
  getGithubClientId,
  handleGithubCallback,
  getGithubRepos,
  disconnectGithub,
  getGithubBranches,
  renderMockAuthorize,
};
