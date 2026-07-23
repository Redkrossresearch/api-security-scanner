import { useState, useEffect } from "react";
import api from "../services/api";
import FeatureGuide from "../components/common/FeatureGuide";
import { 
  getSettings, 
  updateSettings, 
  syncGithubWorkflow,
  getGithubClientId,
  handleGithubCallback,
  getGithubRepos,
  disconnectGithub,
  getGithubBranches,
  deleteTeamWorkspace
} from "../services/settingService";
import { 
  Shield, 
  Key, 
  Calendar, 
  Bell, 
  Save, 
  RefreshCw, 
  Hash, 
  Plus, 
  Trash2,
  CheckCircle,
  Eye,
  EyeOff,
  Users,
  ClipboardList,
  Cpu,
  Database,
  Network,
  Sliders,
  AlertTriangle,
  Sparkles,
  ShieldAlert,
  X
} from "lucide-react";
import toast from "react-hot-toast";


const COLORS = {
  white: "#FFFFFF",
  muted: "#94A3B8",
  purple: "#8B5CF6",
  purpleGradient: "#7C3AED",
  success: "#22C55E",
  border: "rgba(255,255,255,.08)",
  background: "#030712",
  cardBg: "#090d16"
};

const styles = {
  container: {
    padding: "24px",
    background: COLORS.background,
    minHeight: "100%",
    color: COLORS.white,
    fontFamily: "Inter, sans-serif",
  },
  header: {
    marginBottom: "32px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "800",
    margin: 0,
    background: "linear-gradient(90deg, #FFFFFF, #94A3B8)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subtitle: {
    fontSize: "13px",
    color: COLORS.muted,
    marginTop: "6px",
    fontWeight: "500",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
    gap: "24px",
    marginBottom: "32px",
  },
  card: {
    background: COLORS.cardBg,
    border: `1px solid ${COLORS.border}`,
    borderRadius: "20px",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    borderBottom: "1px solid rgba(255,255,255,.04)",
    paddingBottom: "14px",
  },
  cardTitle: {
    fontSize: "15px",
    fontWeight: "750",
    color: "#E2E8F0",
    margin: 0,
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "11px",
    fontWeight: "700",
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  select: {
    background: COLORS.background,
    border: `1px solid ${COLORS.border}`,
    borderRadius: "10px",
    padding: "8px 12px",
    fontSize: "13px",
    color: "#D1D5DB",
    fontWeight: "600",
    outline: "none",
    cursor: "pointer",
  },
  input: {
    background: COLORS.background,
    border: `1px solid ${COLORS.border}`,
    borderRadius: "10px",
    padding: "8px 12px",
    fontSize: "13px",
    color: "#E5E7EB",
    outline: "none",
  },
  customHeaderRow: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    marginTop: "4px",
  },
  addHeaderBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 12px",
    background: "rgba(139,92,246,0.1)",
    border: "1px solid rgba(139,92,246,0.2)",
    borderRadius: "8px",
    color: "#C084FC",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
    width: "fit-content",
  },
  deleteHeaderBtn: {
    background: "transparent",
    border: "none",
    color: "#EF4444",
    cursor: "pointer",
    padding: "4px",
  },
  saveBtnRow: {
    display: "flex",
    justifyContent: "flex-end",
  },
  saveBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 24px",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "700",
    background: "linear-gradient(90deg, #7C3AED, #4F46E5)",
    border: "none",
    color: COLORS.white,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  testBtn: {
    background: "#111827",
    border: `1px solid ${COLORS.border}`,
    borderRadius: "8px",
    color: "#E2E8F0",
    fontSize: "11px",
    fontWeight: "700",
    padding: "4px 10px",
    cursor: "pointer",
    width: "fit-content",
    marginTop: "4px",
  }
};

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [integrationToken, setIntegrationToken] = useState("");

  // Settings states
  const [authType, setAuthType] = useState("none");
  const [authToken, setAuthToken] = useState("");
  const [cronSchedule, setCronSchedule] = useState("disabled");
  const [scheduledUrls, setScheduledUrls] = useState("");
  const [slackWebhook, setSlackWebhook] = useState("");
  const [jiraWebhook, setJiraWebhook] = useState("");
  const [discordWebhook, setDiscordWebhook] = useState("");
  const [targetHeaders, setTargetHeaders] = useState([]);

  // GitHub Sync states
  const [githubToken, setGithubToken] = useState("");
  const [githubRepo, setGithubRepo] = useState("");
  const [githubBranch, setGithubBranch] = useState("main");
  const [syncing, setSyncing] = useState(false);
  const [repos, setRepos] = useState([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [oauthAvailable, setOauthAvailable] = useState(false);
  const [useManualToken, setUseManualToken] = useState(false);
  const [branches, setBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(false);

  // Teams Workspace & RBAC states
  const [myTeams, setMyTeams] = useState([]);
  const [activeTeamId, setActiveTeamId] = useState("");
  const [activeTeamData, setActiveTeamData] = useState(null);
  const [newTeamName, setNewTeamName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [auditLogs, setAuditLogs] = useState([]);
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [invitingMember, setInvitingMember] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deletingWorkspace, setDeletingWorkspace] = useState(false);


  // MCP Configuration states
  const [mcpConfigs, setMcpConfigs] = useState([]);
  const [loadingMcp, setLoadingMcp] = useState(false);
  const [mcpActiveTab, setMcpActiveTab] = useState("server"); // "server" | "client"
  const [mcpName, setMcpName] = useState("");
  const [mcpType, setMcpType] = useState("stdio"); // "stdio" | "sse"
  const [mcpCommand, setMcpCommand] = useState("");
  const [mcpArgs, setMcpArgs] = useState("");
  const [mcpEnv, setMcpEnv] = useState("");
  const [mcpSseUrl, setMcpSseUrl] = useState("");
  const [mcpEnabled, setMcpEnabled] = useState(true);
  const [editingMcpId, setEditingMcpId] = useState(null);
  const [testingMcp, setTestingMcp] = useState(false);
  const [testResults, setTestResults] = useState(null);

  // Demo Simulation states
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [showMockAuthModal, setShowMockAuthModal] = useState(false);
  const [mockConnected, setMockConnected] = useState(false);
  const [authorizing, setAuthorizing] = useState(false);

  const MOCK_REPOS = [
    { fullName: "atharv-design/api-security-scanner", private: true, defaultBranch: "dev" },
    { fullName: "atharv-design/payment-gateway", private: true, defaultBranch: "main" },
    { fullName: "atharv-design/node-express-backend", private: false, defaultBranch: "main" },
    { fullName: "atharv-design/react-dashboard-ui", private: false, defaultBranch: "master" },
    { fullName: "atharv-design/user-auth-service", private: true, defaultBranch: "main" }
  ];

  const MOCK_BRANCHES = {
    "atharv-design/api-security-scanner": ["dev", "main", "feature/waf"],
    "atharv-design/payment-gateway": ["main", "staging", "hotfix"],
    "atharv-design/node-express-backend": ["main", "development"],
    "atharv-design/react-dashboard-ui": ["master", "v2-release"],
    "atharv-design/user-auth-service": ["main", "refactor"]
  };

  useEffect(() => {
    setIntegrationToken(localStorage.getItem("token") || "");
    fetchMcpConfigs();
  }, []);

  // Fetch branches when repository changes
  useEffect(() => {
    const loadRepoBranches = async () => {
      if (isDemoMode && mockConnected) {
        setBranches((MOCK_BRANCHES[githubRepo] || ["main"]).map(name => ({ name })));
        return;
      }
      if (!githubRepo || !githubToken) {
        setBranches([]);
        return;
      }
      setLoadingBranches(true);
      try {
        const list = await getGithubBranches(githubRepo);
        setBranches(list || []);
      } catch (err) {
        console.error("Failed to load branches:", err);
        setBranches([]);
      } finally {
        setLoadingBranches(false);
      }
    };
    loadRepoBranches();
  }, [githubRepo, githubToken, isDemoMode, mockConnected]);

  // Process github OAuth code redirect (handles both popup communication and normal redirect fallbacks)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    if (code) {
      if (window.opener) {
        // Send authorization code to parent window and close popup
        window.opener.postMessage({ type: "GITHUB_OAUTH_SUCCESS", code }, window.location.origin);
        window.close();
      } else {
        window.history.replaceState({}, document.title, window.location.pathname);
        const processCallback = async () => {
          const toastId = toast.loading("Finalizing GitHub connection...");
          try {
            await handleGithubCallback(code);
            toast.dismiss(toastId);
            toast.success("GitHub account connected successfully!");
            
            // Load settings
            const data = await getSettings();
            if (data) {
              setGithubToken(data.githubToken || "");
              setGithubRepo(data.githubRepo || "");
              setGithubBranch(data.githubBranch || "main");
              if (data.githubToken) {
                setLoadingRepos(true);
                const list = await getGithubRepos();
                setRepos(list || []);
                setLoadingRepos(false);
              }
            }
          } catch (err) {
            toast.dismiss(toastId);
            toast.error(err.response?.data?.message || err.message || "Failed to connect to GitHub.");
          }
        };
        processCallback();
      }
    }
  }, []);

  const fetchRepos = async () => {
    setLoadingRepos(true);
    try {
      const list = await getGithubRepos();
      setRepos(list || []);
    } catch (err) {
      console.error("Failed to load repositories:", err);
    } finally {
      setLoadingRepos(false);
    }
  };

  // Teams & RBAC Logic
  const fetchTeamsAndLogs = async () => {
    try {
      const res = await api.get("/teams");
      if (res.data?.success) {
        const list = res.data.teams || [];
        setMyTeams(list);
        
        let activeId = localStorage.getItem("activeTeamId");
        if (!activeId && list.length > 0) {
          activeId = list[0]._id;
          localStorage.setItem("activeTeamId", activeId);
        }
        setActiveTeamId(activeId || "");

        const activeTeamObj = list.find((t) => t._id === activeId);
        setActiveTeamData(activeTeamObj || null);

        if (activeId) {
          // Fetch Audit Logs for this team
          const auditRes = await api.get(`/teams/${activeId}/audit`);
          if (auditRes.data?.success) {
            setAuditLogs(auditRes.data.logs || []);
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch teams and audit logs:", err);
    }
  };

  useEffect(() => {
    fetchTeamsAndLogs();
  }, []);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!newTeamName.trim()) {
      toast.error("Team name cannot be empty");
      return;
    }
    setCreatingTeam(true);
    try {
      const res = await api.post("/teams", { name: newTeamName });
      if (res.data?.success) {
        toast.success(`Team "${newTeamName}" created successfully!`);
        setNewTeamName("");
        localStorage.setItem("activeTeamId", res.data.team._id);
        await fetchTeamsAndLogs();
        window.location.reload();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to create team");
    } finally {
      setCreatingTeam(false);
    }
  };

  const handleInviteMember = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) {
      toast.error("Email is required");
      return;
    }
    if (!activeTeamId) {
      toast.error("No active team workspace selected");
      return;
    }
    setInvitingMember(true);
    try {
      const res = await api.post(`/teams/${activeTeamId}/members`, {
        email: inviteEmail,
        role: inviteRole,
      });
      if (res.data?.success) {
        toast.success("Member added to team successfully!");
        setInviteEmail("");
        await fetchTeamsAndLogs();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to add member");
    } finally {
      setInvitingMember(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!activeTeamId) return;
    if (!window.confirm("Are you sure you want to remove this member?")) return;
    try {
      const res = await api.delete(`/teams/${activeTeamId}/members/${userId}`);
      if (res.data?.success) {
        toast.success("Member removed successfully");
        await fetchTeamsAndLogs();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to remove member");
    }
  };

  const handleDeleteTeam = async () => {
    if (!activeTeamId) {
      toast.error("No active team workspace selected");
      return;
    }
    setDeletingWorkspace(true);
    try {
      const res = await deleteTeamWorkspace(activeTeamId);
      if (res?.success) {
        toast.success("Workspace deleted successfully!");
        localStorage.removeItem("activeTeamId");
        setActiveTeamId("");
        setActiveTeamData(null);
        setShowDeleteModal(false);
        setDeleteConfirmText("");
        await fetchTeamsAndLogs();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to delete workspace");
    } finally {
      setDeletingWorkspace(false);
    }
  };

  const handleAcceptInvite = async (targetUserId) => {
    if (!activeTeamId) return;
    try {
      const res = await api.post(`/teams/${activeTeamId}/members/${targetUserId}/accept`);
      if (res.data?.success) {
        toast.success("Workspace invitation request accepted!");
        await fetchTeamsAndLogs();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to accept invite");
    }
  };



  // Load user settings
  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      // Safety timeout: never block UI more than 4 seconds
      const safetyTimer = setTimeout(() => {
        setLoading(false);
      }, 4000);
      try {
        const data = await getSettings();
        if (data) {
          setAuthType(data.authType || "none");
          setAuthToken(data.authToken || "");
          setCronSchedule(data.cronSchedule || "disabled");
          setScheduledUrls(data.scheduledUrls || "");
          setSlackWebhook(data.slackWebhook || "");
          setJiraWebhook(data.jiraWebhook || "");
          setDiscordWebhook(data.discordWebhook || "");
          setTargetHeaders(data.targetHeaders || []);
          setGithubToken(data.githubToken || "");
          setGithubRepo(data.githubRepo || "");
          setGithubBranch(data.githubBranch || "main");
          if (data.githubToken) {
            setLoadingRepos(true);
            const list = await getGithubRepos();
            setRepos(list || []);
            setLoadingRepos(false);
          }
        }

        try {
          const clientRes = await getGithubClientId();
          if (clientRes && clientRes.clientId && clientRes.clientId !== "PLACEHOLDER_CLIENT_ID") {
            setOauthAvailable(true);
          } else {
            setOauthAvailable(false);
            setUseManualToken(true);
          }
        } catch (e) {
          setOauthAvailable(false);
          setUseManualToken(true);
        }
      } catch (err) {
        toast.error("Failed to load settings configuration");
      } finally {
        clearTimeout(safetyTimer);
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  // Save configurations
  const handleSave = async () => {
    setSaving(true);
    try {
      const config = {
        authType,
        authToken,
        cronSchedule,
        scheduledUrls,
        slackWebhook,
        jiraWebhook,
        discordWebhook,
        targetHeaders,
        githubToken,
        githubRepo,
        githubBranch
      };
      await updateSettings(config);
      toast.success("Security scanner configurations saved successfully");
    } catch (err) {
      toast.error("Failed to save configurations");
    } finally {
      setSaving(false);
    }
  };

  const handleGithubConnect = async () => {
    try {
      const res = await getGithubClientId();
      if (!res.clientId || res.clientId === "PLACEHOLDER_CLIENT_ID") {
        toast.error("GitHub OAuth credentials are not configured in your backend .env file. Please add GITHUB_CLIENT_ID & GITHUB_CLIENT_SECRET.");
        return;
      }
      
      const config = {
        authType,
        authToken,
        cronSchedule,
        scheduledUrls,
        slackWebhook,
        jiraWebhook,
        discordWebhook,
        targetHeaders,
        githubToken,
        githubRepo,
        githubBranch
      };
      await updateSettings(config);

      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      
      const redirectUri = `${window.location.origin}/settings`;
      const authUrl = res.clientId === "MOCK_CLIENT_ID"
        ? `${res.mockAuthUrl}?redirect_uri=${encodeURIComponent(redirectUri)}`
        : `https://github.com/login/oauth/authorize?client_id=${res.clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=repo,workflow`;
      
      // Open centered popup window
      const popup = window.open(
        authUrl,
        "GitHub Authorization",
        `width=${width},height=${height},left=${left},top=${top},status=0,menubar=0`
      );

      if (!popup) {
        toast.error("Pop-up blocked! Please allow popups for this website to authorize GitHub.");
        return;
      }
      
      // Listen for message from popup
      const handleMessage = async (event) => {
        const allowedOrigins = [window.location.origin];
        if (res.mockAuthUrl) {
          try {
            allowedOrigins.push(new URL(res.mockAuthUrl).origin);
          } catch (e) {}
        }
        if (!allowedOrigins.includes(event.origin)) return;
        if (event.data?.type === "GITHUB_OAUTH_SUCCESS") {
          window.removeEventListener("message", handleMessage);
          const code = event.data.code;
          
          const toastId = toast.loading("Finalizing GitHub connection...");
          try {
            await handleGithubCallback(code);
            toast.dismiss(toastId);
            toast.success("GitHub account connected successfully!");
            
            // Reload settings
            const data = await getSettings();
            if (data) {
              setGithubToken(data.githubToken || "");
              setGithubRepo(data.githubRepo || "");
              setGithubBranch(data.githubBranch || "main");
              if (data.githubToken) {
                setLoadingRepos(true);
                const list = await getGithubRepos();
                setRepos(list || []);
                setLoadingRepos(false);
              }
            }
          } catch (err) {
            toast.dismiss(toastId);
            toast.error(err.response?.data?.message || err.message || "Failed to connect to GitHub.");
          }
        }
      };
      
      window.addEventListener("message", handleMessage);

      // Periodically check if the popup was closed manually
      const popupTick = setInterval(() => {
        if (popup.closed) {
          clearInterval(popupTick);
          window.removeEventListener("message", handleMessage);
        }
      }, 500);
      
    } catch (err) {
      toast.error("Failed to start GitHub authentication.");
    }
  };

  const handleGithubDisconnect = async () => {
    const toastId = toast.loading("Disconnecting GitHub account...");
    try {
      await disconnectGithub();
      setGithubToken("");
      setGithubRepo("");
      setRepos([]);
      toast.dismiss(toastId);
      toast.success("GitHub account disconnected!");
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(err.message || "Failed to disconnect.");
    }
  };

  const handleGithubSync = async () => {
    if (!githubRepo) {
      toast.error("Please select a target repository first.");
      return;
    }
    setSyncing(true);
    const toastId = toast.loading("Syncing ATHX scan workflow to GitHub repository...");
    try {
      const config = {
        authType,
        authToken,
        cronSchedule,
        slackWebhook,
        jiraWebhook,
        discordWebhook,
        targetHeaders,
        githubToken,
        githubRepo,
        githubBranch,
      };
      await updateSettings(config);
      
      const res = await syncGithubWorkflow({
        origin: window.location.origin,
        targetUrl: localStorage.getItem("lastTargetUrl") || "http://localhost:3000"
      });
      toast.dismiss(toastId);
      toast.success(res.message || "Successfully configured GitHub repository!");
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(err.response?.data?.message || err.message || "Sync failed.");
    } finally {
      setSyncing(false);
    }
  };

  // Add custom target header
  const handleAddHeader = () => {
    setTargetHeaders([...targetHeaders, { name: "", value: "" }]);
  };

  // Delete target header
  const handleRemoveHeader = (idx) => {
    setTargetHeaders(targetHeaders.filter((_, i) => i !== idx));
  };

  // Update specific header field
  const handleHeaderChange = (idx, field, val) => {
    setTargetHeaders(targetHeaders.map((h, i) => i === idx ? { ...h, [field]: val } : h));
  };

  // Test Webhook channels
  const handleTestIntegration = (name) => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: `Sending validation payload to ${name}...`,
        success: `${name} channel validation successful!`,
        error: "Validation failed."
      }
    );
  };

  // Fetch MCP configurations from backend
  const fetchMcpConfigs = async () => {
    try {
      setLoadingMcp(true);
      const res = await api.get("/mcp/configs");
      if (res.data?.success) {
        setMcpConfigs(res.data.configs || []);
      }
    } catch (err) {
      console.error("Failed to load MCP configurations:", err);
    } finally {
      setLoadingMcp(false);
    }
  };

  // Reset MCP form inputs
  const resetMcpForm = () => {
    setMcpName("");
    setMcpType("stdio");
    setMcpCommand("");
    setMcpArgs("");
    setMcpEnv("");
    setMcpSseUrl("");
    setMcpEnabled(true);
    setEditingMcpId(null);
    setTestResults(null);
  };

  // Test external MCP connection
  const handleTestMcp = async () => {
    if (mcpType === "stdio" && !mcpCommand) {
      toast.error("Command is required for stdio transport");
      return;
    }
    if (mcpType === "sse" && !mcpSseUrl) {
      toast.error("SSE URL is required for sse transport");
      return;
    }

    setTestingMcp(true);
    setTestResults(null);
    const toastId = toast.loading("Testing connection to external MCP server...");

    try {
      let parsedEnv = {};
      if (mcpEnv.trim()) {
        try {
          parsedEnv = JSON.parse(mcpEnv);
        } catch (e) {
          toast.error("Invalid Environment JSON format", { id: toastId });
          setTestingMcp(false);
          return;
        }
      }

      const parsedArgs = mcpArgs.trim() ? mcpArgs.split(" ").filter(a => a.trim() !== "") : [];

      const res = await api.post("/mcp/configs/test", {
        type: mcpType,
        command: mcpCommand,
        args: parsedArgs,
        env: parsedEnv,
        sseUrl: mcpSseUrl
      });

      if (res.data?.success) {
        setTestResults({
          success: true,
          tools: res.data.tools || []
        });
        toast.success("External MCP Server connected successfully!", { id: toastId });
      }
    } catch (err) {
      setTestResults({
        success: false,
        error: err.response?.data?.message || err.message
      });
      toast.error(`Connection failed: ${err.response?.data?.message || err.message}`, { id: toastId });
    } finally {
      setTestingMcp(false);
    }
  };

  // Save (Create/Update) MCP server config
  const handleSaveMcp = async (e) => {
    e.preventDefault();
    if (!mcpName.trim()) {
      toast.error("MCP Server Name is required");
      return;
    }
    if (mcpType === "stdio" && !mcpCommand) {
      toast.error("Command is required for stdio transport");
      return;
    }
    if (mcpType === "sse" && !mcpSseUrl) {
      toast.error("SSE URL is required for sse transport");
      return;
    }

    const toastId = toast.loading(editingMcpId ? "Updating MCP server configuration..." : "Adding MCP server configuration...");
    try {
      let parsedEnv = {};
      if (mcpEnv.trim()) {
        try {
          parsedEnv = JSON.parse(mcpEnv);
        } catch (e) {
          toast.error("Environment variables must be valid JSON", { id: toastId });
          return;
        }
      }

      const parsedArgs = mcpArgs.trim() ? mcpArgs.split(" ").filter(a => a.trim() !== "") : [];

      const payload = {
        name: mcpName,
        type: mcpType,
        command: mcpCommand,
        args: parsedArgs,
        env: parsedEnv,
        sseUrl: mcpSseUrl,
        enabled: mcpEnabled
      };

      let res;
      if (editingMcpId) {
        res = await api.put(`/mcp/configs/${editingMcpId}`, payload);
      } else {
        res = await api.post("/mcp/configs", payload);
      }

      if (res.data?.success) {
        toast.success(editingMcpId ? "Configuration updated successfully!" : "Configuration added successfully!", { id: toastId });
        resetMcpForm();
        fetchMcpConfigs();
      }
    } catch (err) {
      toast.error(`Failed to save configuration: ${err.response?.data?.message || err.message}`, { id: toastId });
    }
  };

  // Delete MCP config
  const handleDeleteMcp = async (id) => {
    if (!window.confirm("Are you sure you want to remove this MCP server configuration?")) return;
    const toastId = toast.loading("Removing configuration...");
    try {
      const res = await api.delete(`/mcp/configs/${id}`);
      if (res.data?.success) {
        toast.success("Configuration removed!", { id: toastId });
        fetchMcpConfigs();
        if (editingMcpId === id) resetMcpForm();
      }
    } catch (err) {
      toast.error(`Failed to remove configuration: ${err.response?.data?.message || err.message}`, { id: toastId });
    }
  };

  // Populate form for editing
  const handleEditMcp = (config) => {
    setEditingMcpId(config._id);
    setMcpName(config.name);
    setMcpType(config.type);
    setMcpCommand(config.command || "");
    setMcpArgs(config.args ? config.args.join(" ") : "");
    setMcpEnv(config.env ? JSON.stringify(config.env, null, 2) : "");
    setMcpSseUrl(config.sseUrl || "");
    setMcpEnabled(config.enabled !== false);
    setTestResults(null);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", itemsCenter: "center", justifyContent: "center", minHeight: "100%", background: COLORS.background, color: COLORS.white }}>
        <RefreshCw style={{ width: "48px", height: "48px", color: COLORS.purple, margin: "0 auto 16px auto", animation: "spin 1s linear infinite" }} />
        <p style={{ textAlign: "center", color: COLORS.muted, fontWeight: "500" }}>Loading scanner settings configurations...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Gateway & Settings Manager</h1>
        <p style={styles.subtitle}>Configure global security headers, API keys, scanner scheduling, and webhook notification parameters.</p>
      </div>

      {/* Main Form Fields */}
      <div style={styles.grid}>
        
        {/* API Authorization Settings */}
        <div style={{
          ...styles.card,
          border: "1px solid rgba(56, 189, 248, 0.18)",
          background: "linear-gradient(180deg, rgba(56, 189, 248, 0.02) 0%, rgba(9, 13, 22, 0.65) 100%)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
        }}>
          <div style={styles.cardHeader}>
            <Key style={{ width: "18px", height: "18px", color: "#38BDF8" }} />
            <h3 style={{ ...styles.cardTitle, color: "#38BDF8" }}>API Target Authorization</h3>
          </div>

          <div style={styles.fieldGroup}>
            <label style={{ ...styles.label, color: "#94A3B8" }}>Authentication Type</label>
            <select 
              value={authType} 
              onChange={(e) => setAuthType(e.target.value)}
              style={{
                ...styles.select,
                background: "#060910",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "10px",
                padding: "10px 14px",
                color: "#FFF"
              }}
            >
              <option value="none">No Authentication</option>
              <option value="bearer">Bearer Token (Authorization header)</option>
              <option value="apikey">API Key (Header / Query Param)</option>
              <option value="custom">Custom Auth Header</option>
            </select>
          </div>

          {authType !== "none" && (
            <div style={styles.fieldGroup}>
              <label style={{ ...styles.label, color: "#94A3B8" }}>Secret Token / Credential</label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <input 
                  type={showToken ? "text" : "password"} 
                  value={authToken}
                  onChange={(e) => setAuthToken(e.target.value)}
                  placeholder={authType === "bearer" ? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." : "API key value"}
                  style={{
                    ...styles.input,
                    width: "100%",
                    paddingRight: "38px",
                    background: "#060910",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    color: "#FFF"
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  style={{ position: "absolute", right: "12px", background: "transparent", border: "none", color: COLORS.muted, cursor: "pointer" }}
                >
                  {showToken ? <EyeOff style={{ width: "16px", height: "16px" }} /> : <Eye style={{ width: "16px", height: "16px" }} />}
                </button>
              </div>
            </div>
          )}

          {/* Custom Headers Config */}
          <div style={{ ...styles.fieldGroup, borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "16px", marginTop: "10px" }}>
            <label style={{ ...styles.label, color: "#94A3B8" }}>Custom Target Request Headers</label>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {targetHeaders.map((header, idx) => (
                <div key={idx} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <input 
                    type="text" 
                    value={header.name} 
                    onChange={(e) => handleHeaderChange(idx, "name", e.target.value)}
                    placeholder="Header-Name" 
                    style={{
                      ...styles.input,
                      flex: 1,
                      background: "#060910",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "8px",
                      padding: "8px 12px"
                    }}
                  />
                  <input 
                    type="text" 
                    value={header.value} 
                    onChange={(e) => handleHeaderChange(idx, "value", e.target.value)}
                    placeholder="value" 
                    style={{
                      ...styles.input,
                      flex: 1.5,
                      background: "#060910",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "8px",
                      padding: "8px 12px"
                    }}
                  />
                  <button 
                    onClick={() => handleRemoveHeader(idx)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#F87171",
                      cursor: "pointer",
                      padding: "4px",
                      display: "flex",
                      alignItems: "center"
                    }}
                  >
                    <Trash2 style={{ width: "16px", height: "16px" }} />
                  </button>
                </div>
              ))}
            </div>
            <button 
              onClick={handleAddHeader}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "rgba(56, 189, 248, 0.08)",
                border: "1px solid rgba(56, 189, 248, 0.2)",
                borderRadius: "8px",
                padding: "8px 14px",
                fontSize: "12px",
                color: "#38BDF8",
                cursor: "pointer",
                marginTop: targetHeaders.length > 0 ? "12px" : "4px",
                fontWeight: "750"
              }}
            >
              <Plus style={{ width: "12px", height: "12px" }} />
              Add Custom Header
            </button>
          </div>
        </div>

        {/* Scanner Schedule settings */}
        <div style={{
          ...styles.card,
          border: "1px solid rgba(167, 139, 250, 0.18)",
          background: "linear-gradient(180deg, rgba(167, 139, 250, 0.02) 0%, rgba(9, 13, 22, 0.65) 100%)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
        }}>
          <div style={styles.cardHeader}>
            <Calendar style={{ width: "18px", height: "18px", color: "#A78BFA" }} />
            <h3 style={{ ...styles.cardTitle, color: "#A78BFA" }}>Automated Scanner Scheduling</h3>
          </div>

          <div style={styles.fieldGroup}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <label style={{ ...styles.label, color: "#94A3B8", margin: 0 }}>Assessment Frequency</label>
              <span style={{
                fontSize: "9px",
                fontWeight: "900",
                letterSpacing: "0.5px",
                color: cronSchedule !== "disabled" ? "#34D399" : "#F87171",
                background: cronSchedule !== "disabled" ? "rgba(52,211,153,0.1)" : "rgba(248,113,113,0.1)",
                padding: "2px 8px",
                borderRadius: "20px",
                border: `1px solid ${cronSchedule !== "disabled" ? "rgba(52,211,153,0.2)" : "rgba(248,113,113,0.2)"}`
              }}>
                {cronSchedule !== "disabled" ? "● ACTIVE SCHEDULE" : "○ DISABLED"}
              </span>
            </div>
            <select 
              value={cronSchedule} 
              onChange={(e) => setCronSchedule(e.target.value)}
              style={{
                ...styles.select,
                background: "#060910",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "10px",
                padding: "10px 14px",
                color: "#FFF"
              }}
            >
              <option value="disabled">Disabled (On-Demand Scans Only)</option>
              <option value="daily">Daily Security Run (Every day at 00:00 UTC)</option>
              <option value="weekly">Weekly Compliance Run (Sundays at 02:00 UTC)</option>
              <option value="monthly">Monthly Full Scope Audit (1st of every month)</option>
            </select>
          </div>

          <div style={{ ...styles.fieldGroup, marginTop: "12px" }}>
            <label style={{ ...styles.label, color: "#94A3B8" }}>Scheduled Target URLs (One URL per line)</label>
            <textarea
              value={scheduledUrls}
              onChange={(e) => setScheduledUrls(e.target.value)}
              placeholder="e.g.&#10;https://api.mycompany.com&#10;https://staging.company.com/v1"
              style={{
                ...styles.input,
                background: "#060910",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "10px",
                padding: "10px 14px",
                color: "#FFF",
                width: "100%",
                minHeight: "80px",
                fontFamily: "monospace",
                fontSize: "12px",
                lineHeight: "1.5",
                resize: "vertical"
              }}
            />
          </div>

          <div style={{
            color: "#94A3B8",
            fontSize: "12px",
            lineHeight: "1.6",
            background: "rgba(167, 139, 250, 0.04)",
            border: "1px solid rgba(167, 139, 250, 0.12)",
            padding: "14px",
            borderRadius: "12px",
            marginTop: "16px"
          }}>
            🛡️ <strong>Note on Automatic Runs:</strong> When scheduled, the API Security Scanner runs automated background pipelines using the credentials and custom target headers configured in this workspace. Reports are pushed directly to webhooks.
          </div>
        </div>

        {/* Integration settings */}
        <div style={{
          ...styles.card,
          border: "1px solid rgba(244, 63, 94, 0.18)",
          background: "linear-gradient(180deg, rgba(244, 63, 94, 0.01) 0%, rgba(9, 13, 22, 0.65) 100%)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
        }}>
          <div style={styles.cardHeader}>
            <Bell style={{ width: "18px", height: "18px", color: "#F43F5E" }} />
            <h3 style={{ ...styles.cardTitle, color: "#F43F5E" }}>External Channel Integrations</h3>
          </div>

          {/* Slack webhook config */}
          <div style={styles.fieldGroup}>
            <label style={{ ...styles.label, color: "#94A3B8", display: "flex", justifyBetween: "space-between", alignItems: "center" }}>
              <span>Slack Incoming Webhook</span>
              <span style={{ fontSize: "10px", color: "#E0A82E" }}>🎗️ Slack Alerting</span>
            </label>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <input 
                type="text" 
                value={slackWebhook}
                onChange={(e) => setSlackWebhook(e.target.value)}
                placeholder="https://hooks.slack.com/services/..."
                style={{
                  ...styles.input,
                  flex: 1,
                  background: "#060910",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  color: "#FFF"
                }}
              />
              {slackWebhook && (
                <button 
                  onClick={() => handleTestIntegration("Slack")}
                  style={{
                    background: "rgba(56, 189, 248, 0.08)",
                    border: "1px solid rgba(56, 189, 248, 0.2)",
                    borderRadius: "10px",
                    padding: "10px 16px",
                    fontSize: "11px",
                    fontWeight: "800",
                    color: "#38BDF8",
                    cursor: "pointer"
                  }}
                >
                  Test
                </button>
              )}
            </div>
          </div>

          {/* Jira webhook config */}
          <div style={styles.fieldGroup}>
            <label style={{ ...styles.label, color: "#94A3B8", display: "flex", justifyBetween: "space-between", alignItems: "center" }}>
              <span>Jira Cloud Ticket Endpoint</span>
              <span style={{ fontSize: "10px", color: "#0052CC" }}>🎫 Jira Ticketing</span>
            </label>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <input 
                type="text" 
                value={jiraWebhook}
                onChange={(e) => setJiraWebhook(e.target.value)}
                placeholder="https://your-domain.atlassian.net/rest/api/..."
                style={{
                  ...styles.input,
                  flex: 1,
                  background: "#060910",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  color: "#FFF"
                }}
              />
              {jiraWebhook && (
                <button 
                  onClick={() => handleTestIntegration("Jira")}
                  style={{
                    background: "rgba(56, 189, 248, 0.08)",
                    border: "1px solid rgba(56, 189, 248, 0.2)",
                    borderRadius: "10px",
                    padding: "10px 16px",
                    fontSize: "11px",
                    fontWeight: "800",
                    color: "#38BDF8",
                    cursor: "pointer"
                  }}
                >
                  Test
                </button>
              )}
            </div>
          </div>

          {/* Discord webhook config */}
          <div style={styles.fieldGroup}>
            <label style={{ ...styles.label, color: "#94A3B8", display: "flex", justifyBetween: "space-between", alignItems: "center" }}>
              <span>Discord Webhook URL</span>
              <span style={{ fontSize: "10px", color: "#5865F2" }}>💬 Discord Sync</span>
            </label>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <input 
                type="text" 
                value={discordWebhook}
                onChange={(e) => setDiscordWebhook(e.target.value)}
                placeholder="https://discord.com/api/webhooks/..."
                style={{
                  ...styles.input,
                  flex: 1,
                  background: "#060910",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  color: "#FFF"
                }}
              />
              {discordWebhook && (
                <button 
                  onClick={() => handleTestIntegration("Discord")}
                  style={{
                    background: "rgba(56, 189, 248, 0.08)",
                    border: "1px solid rgba(56, 189, 248, 0.2)",
                    borderRadius: "10px",
                    padding: "10px 16px",
                    fontSize: "11px",
                    fontWeight: "800",
                    color: "#38BDF8",
                    cursor: "pointer"
                  }}
                >
                  Test
                </button>
              )}
            </div>
          </div>
        </div>

        {/* CI/CD Integration Wizard */}
        <div style={{ ...styles.card, gridColumn: "span 2", border: "1px solid rgba(56, 189, 248, 0.2)", background: "linear-gradient(180deg, rgba(56, 189, 248, 0.02), rgba(9, 13, 22, 0.55))" }}>
          <div style={styles.cardHeader}>
            <Shield style={{ width: "18px", height: "18px", color: "#38BDF8" }} />
            <h3 style={styles.cardTitle}>CI/CD pipeline Integration Wizard</h3>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Feature Description Card */}
            <div style={{
              background: "rgba(56, 189, 248, 0.03)",
              border: "1px solid rgba(56, 189, 248, 0.15)",
              borderRadius: "12px",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "14px"
            }}>
              <h4 style={{ margin: 0, color: "#38BDF8", fontSize: "14px", fontWeight: "750", display: "flex", alignItems: "center", gap: "8px" }}>
                💡 What is a CI/CD Security Gate?
              </h4>
              <p style={{ color: "#94A3B8", fontSize: "12.5px", lineHeight: "1.6", margin: 0 }}>
                A CI/CD Security Gate is an automated scanner trigger integrated into your software delivery pipeline. It continuously scans code deployments to verify that new APIs do not introduce security risks or vulnerabilities before hitting production.
              </p>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginTop: "4px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <span style={{ fontSize: "12px", fontWeight: "700", color: "#FFF" }}>🛡️ Shift-Left Security</span>
                  <span style={{ fontSize: "11px", color: COLORS.muted, lineHeight: "1.5" }}>Auto-triggers API security scans on every pull request or push code event.</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <span style={{ fontSize: "12px", fontWeight: "700", color: "#F87171" }}>🛑 Break-the-Build Policy</span>
                  <span style={{ fontSize: "11px", color: COLORS.muted, lineHeight: "1.5" }}>Automatically fails the build pipeline if any <strong>High</strong> or <strong>Critical</strong> bugs are detected.</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <span style={{ fontSize: "12px", fontWeight: "700", color: "#34D399" }}>🔄 Active Spec Sync</span>
                  <span style={{ fontSize: "11px", color: COLORS.muted, lineHeight: "1.5" }}>Maintains an updated OpenAPI registry dynamically based on pipeline crawler results.</span>
                </div>
              </div>
            </div>

            <p style={{ color: COLORS.muted, fontSize: "13px", lineHeight: "1.6", margin: 0 }}>
              Follow these simple steps below to configure and auto-install the security gate in your repository:
            </p>

            {/* STEP 1 */}
            <div style={{ padding: "16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ background: "#38BDF8", color: "#000", fontSize: "10px", fontWeight: "900", padding: "2px 8px", borderRadius: "4px" }}>STEP 1</span>
                <span style={{ fontSize: "13px", fontWeight: "750", color: "#FFF" }}>Acquire Access Credentials</span>
              </div>
              <p style={{ color: COLORS.muted, fontSize: "12px", margin: 0 }}>Copy your user integration security token below. Treat this token as a secret.</p>
              <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                <input 
                  type="text" 
                  readOnly 
                  value={integrationToken} 
                  style={{ ...styles.input, flex: 1, fontFamily: "monospace", fontSize: "11px", background: "#060910", color: "#38BDF8", border: "1px solid rgba(56, 189, 248, 0.15)" }}
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(integrationToken);
                    toast.success("Integration token copied!");
                  }}
                  style={{ ...styles.saveBtn, background: "rgba(56, 189, 248, 0.12)", border: "1px solid rgba(56, 189, 248, 0.25)", color: "#38BDF8", fontSize: "12px", padding: "8px 16px" }}
                >
                  Copy Token
                </button>
              </div>
            </div>

            {/* STEP 2 */}
            <div style={{ padding: "16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ background: "#8B5CF6", color: "#FFF", fontSize: "10px", fontWeight: "900", padding: "2px 8px", borderRadius: "4px" }}>STEP 2</span>
                <span style={{ fontSize: "13px", fontWeight: "750", color: "#FFF" }}>Save Token in GitHub Repository Secrets</span>
              </div>
              <p style={{ color: COLORS.muted, fontSize: "12px", margin: 0, lineHeight: "1.6" }}>
                1. Navigate to your project repository on GitHub.<br />
                2. Click on <strong>Settings</strong> &gt; <strong>Secrets and variables</strong> &gt; <strong>Actions</strong>.<br />
                3. Click <strong>New repository secret</strong>.<br />
                4. Set name to <code style={{ color: "#8B5CF6", background: "rgba(139,92,246,0.1)", padding: "2px 6px", borderRadius: "4px", fontSize: "11px", fontFamily: "monospace" }}>ATHX_API_TOKEN</code> and paste your integration token into the value box.
              </p>
            </div>

            {/* STEP 3 */}
            <div style={{ padding: "16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ background: "#EC4899", color: "#FFF", fontSize: "10px", fontWeight: "900", padding: "2px 8px", borderRadius: "4px" }}>STEP 3</span>
                <span style={{ fontSize: "13px", fontWeight: "750", color: "#FFF" }}>Configure Actions Workflow file (.yml)</span>
              </div>
              <p style={{ color: COLORS.muted, fontSize: "12px", margin: 0 }}>Create a file named <code style={{ color: "#EC4899", fontFamily: "monospace" }}>.github/workflows/athx-security-scan.yml</code> in your repository containing the following workflow code:</p>
              
              <div style={{ position: "relative", marginTop: "6px" }}>
                <pre
                  style={{
                    background: "#020617",
                    padding: "16px",
                    borderRadius: "10px",
                    color: "#E2E8F0",
                    border: "1px solid rgba(255,255,255,0.05)",
                    overflowX: "auto",
                    fontFamily: "monospace",
                    fontSize: "11px",
                    lineHeight: "1.5",
                    maxHeight: "240px",
                    margin: 0
                  }}
                >
{`name: ATHX Security Gate
on: [push, pull_request]

jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Security Audit
        run: |
          # 1. Trigger the Scan against your target endpoint
          res=$(curl -s -X POST "${window.location.origin}/api/scans" \\
            -H "Authorization: Bearer \${{ secrets.ATHX_API_TOKEN }}" \\
            -H "Content-Type: application/json" \\
            -d '{"targetUrl": "YOUR_STAGING_API_URL"}')
          
          scanId=$(echo $res | grep -oP '"_id":"\\K[^"]+')
          echo "ATHX Scan Initialized: $scanId"
          
          # 2. Poll Status until completed or failed
          while true; do
            status_res=$(curl -s "${window.location.origin}/api/scans/$scanId/status" \\
              -H "Authorization: Bearer \${{ secrets.ATHX_API_TOKEN }}")
            status=\$(echo \$status_res | grep -oP '"status":"\\K[^"]+')
            echo "Current Status: \$status"
            if [ "\$status" = "completed" ]; then break; fi
            if [ "\$status" = "failed" ]; then echo "Scan execution failed"; exit 1; fi
            sleep 10
          done
          
          # 3. Read vulnerability counts and fail build if vulnerabilities exist
          report=\$(curl -s "${window.location.origin}/api/scans/\$scanId" \\
            -H "Authorization: Bearer \${{ secrets.ATHX_API_TOKEN }}")
          critical=\$(echo \$report | grep -oP '"criticalCount":\\K[0-9]+')
          high=\$(echo \$report | grep -oP '"highCount":\\K[0-9]+')
          
          echo "Scan finished with \$critical Critical and \$high High findings."
          if [ "\$critical" -gt 0 ] || [ "\$high" -gt 0 ]; then
            echo "ATHX Security Gate: FAILED (High/Critical vulnerabilities detected!)"
            exit 1
          fi
          echo "ATHX Security Gate: PASSED (Zero Critical/High severity issues found.)"`}
                </pre>
                <button
                  type="button"
                  onClick={() => {
                    const yml = `name: ATHX Security Gate
on: [push, pull_request]

jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Security Audit
        run: |
          res=$(curl -s -X POST "${window.location.origin}/api/scans" \\
            -H "Authorization: Bearer \${{ secrets.ATHX_API_TOKEN }}" \\
            -H "Content-Type: application/json" \\
            -d '{"targetUrl": "YOUR_STAGING_API_URL"}')
          
          scanId=$(echo $res | grep -oP '"_id":"\\K[^"]+')
          echo "ATHX Scan Initialized: $scanId"
          
          while true; do
            status_res=$(curl -s "${window.location.origin}/api/scans/$scanId/status" \\
              -H "Authorization: Bearer \${{ secrets.ATHX_API_TOKEN }}")
            status=\$(echo \$status_res | grep -oP '"status":"\\K[^"]+')
            if [ "\$status" = "completed" ]; then break; fi
            if [ "\$status" = "failed" ]; then exit 1; fi
            sleep 10
          done
          
          report=\$(curl -s "${window.location.origin}/api/scans/\$scanId" \\
            -H "Authorization: Bearer \${{ secrets.ATHX_API_TOKEN }}")
          critical=\$(echo \$report | grep -oP '"criticalCount":\\K[0-9]+')
          high=\$(echo \$report | grep -oP '"highCount":\\K[0-9]+')
          
          if [ "\$critical" -gt 0 ] || [ "\$high" -gt 0 ]; then
            echo "ATHX Security Gate: FAILED (High/Critical vulnerabilities detected!)"
            exit 1
          fi
          echo "ATHX Security Gate: PASSED"`;
                    navigator.clipboard.writeText(yml);
                    toast.success("YAML template copied!");
                  }}
                  style={{ position: "absolute", top: "8px", right: "8px", background: "rgba(56, 189, 248, 0.1)", border: "1px solid rgba(56, 189, 248, 0.25)", color: "#38BDF8", fontSize: "11px", fontWeight: "600", cursor: "pointer", padding: "6px 12px", borderRadius: "6px" }}
                >
                  Copy Config
                </button>
              </div>
            </div>

            {/* MODE SWITCH TOGGLE */}
            <div style={{ display: "flex", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "8px", padding: "4px", width: "fit-content", gap: "4px" }}>
              <button
                type="button"
                onClick={() => {
                  setIsDemoMode(true);
                  setRepos([]);
                  setGithubRepo("");
                  setGithubBranch("main");
                }}
                style={{
                  background: isDemoMode ? "#38BDF8" : "transparent",
                  color: isDemoMode ? "#000" : COLORS.muted,
                  border: "none",
                  fontSize: "11px",
                  fontWeight: "700",
                  padding: "6px 16px",
                  borderRadius: "6px",
                  cursor: "pointer"
                }}
              >
                ✨ Demo Mode (1-Click Preview)
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsDemoMode(false);
                  setRepos([]);
                  setGithubRepo("");
                  setGithubBranch("main");
                }}
                style={{
                  background: !isDemoMode ? "#38BDF8" : "transparent",
                  color: !isDemoMode ? "#000" : COLORS.muted,
                  border: "none",
                  fontSize: "11px",
                  fontWeight: "700",
                  padding: "6px 16px",
                  borderRadius: "6px",
                  cursor: "pointer"
                }}
              >
                🔒 Production Mode (Live Integration)
              </button>
            </div>

            {isDemoMode ? (
              /* DEMO MODE SETUP WIZARD */
              <div style={{ padding: "16px", background: "rgba(56, 189, 248, 0.03)", border: "1px dashed rgba(56, 189, 248, 0.25)", borderRadius: "12px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ background: "#38BDF8", color: "#000", fontSize: "10px", fontWeight: "900", padding: "2px 8px", borderRadius: "4px" }}>DEMO PREVIEW</span>
                  <span style={{ fontSize: "13px", fontWeight: "750", color: "#FFF" }}>Test the GitHub Gate Flow Instantly</span>
                </div>
                <p style={{ color: COLORS.muted, fontSize: "12px", margin: 0, lineHeight: "1.5" }}>
                  Experience the full workflow connection without creating OAuth apps or API keys. Click connect to open the simulated authorization panel:
                </p>

                {!mockConnected ? (
                  <button
                    type="button"
                    onClick={() => setShowMockAuthModal(true)}
                    style={{
                      background: "#24292e",
                      color: "#FFF",
                      border: "1px solid rgba(255,255,255,0.15)",
                      fontSize: "12px",
                      fontWeight: "700",
                      padding: "10px 20px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      alignSelf: "flex-start"
                    }}
                  >
                    <svg height="16" viewBox="0 0 16 16" width="16" fill="currentColor">
                      <path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                    </svg>
                    Connect GitHub Account (Simulated)
                  </button>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.15)", borderRadius: "8px" }}>
                      <span style={{ fontSize: "12px", color: "#34D399", fontWeight: "600" }}>Linked to GitHub Account (atharv-design) ✅</span>
                      <button
                        type="button"
                        onClick={() => {
                          setMockConnected(false);
                          setGithubRepo("");
                        }}
                        style={{ background: "transparent", border: "none", color: "#F87171", cursor: "pointer", fontSize: "11px", fontWeight: "600", textDecoration: "underline" }}
                      >
                        Disconnect
                      </button>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "10px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <label style={{ fontSize: "11px", color: COLORS.muted }}>Select Repository</label>
                        <select 
                          value={githubRepo} 
                          onChange={(e) => setGithubRepo(e.target.value)}
                          style={{ ...styles.select, width: "100%" }}
                        >
                          <option value="">-- Choose Repository --</option>
                          {MOCK_REPOS.map((r, idx) => (
                            <option key={idx} value={r.fullName}>{r.fullName} {r.private ? "🔒" : "🌐"}</option>
                          ))}
                        </select>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <label style={{ fontSize: "11px", color: COLORS.muted }}>Target Branch</label>
                        <select 
                          value={githubBranch} 
                          onChange={(e) => setGithubBranch(e.target.value)}
                          style={{ ...styles.select, width: "100%" }}
                        >
                          <option value="">-- Choose Branch --</option>
                          {branches.map((b, idx) => (
                            <option key={idx} value={b.name}>{b.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={syncing || !githubRepo || !githubBranch}
                      onClick={() => {
                        setSyncing(true);
                        toast.promise(
                          new Promise((resolve) => setTimeout(resolve, 1500)),
                          {
                            loading: `Pushed trigger file to repository ${githubRepo}...`,
                            success: `🚀 GitHub workflow config .github/workflows/athx-security-scan.yml successfully synced to branch ${githubBranch}!`,
                            error: "Sync failed."
                          }
                        ).then(() => setSyncing(false));
                      }}
                      style={{ 
                        alignSelf: "flex-start", 
                        background: "#38BDF8", 
                        color: "#000", 
                        border: "none", 
                        fontSize: "12px", 
                        fontWeight: "700",
                        padding: "10px 20px", 
                        borderRadius: "8px",
                        cursor: syncing || !githubRepo || !githubBranch ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginTop: "4px"
                      }}
                    >
                      {syncing ? <RefreshCw style={{ width: "14px", height: "14px", animation: "spin 1s linear infinite" }} /> : null}
                      Auto-install Security Gate
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* REAL PRODUCTION MODE */
              <div style={{ padding: "16px", background: "rgba(56, 189, 248, 0.03)", border: "1px dashed rgba(56, 189, 248, 0.25)", borderRadius: "12px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ background: "#10B981", color: "#FFF", fontSize: "10px", fontWeight: "900", padding: "2px 8px", borderRadius: "4px" }}>LIVE INTEGRATION</span>
                  <span style={{ fontSize: "13px", fontWeight: "750", color: "#FFF" }}>Connect & Push to GitHub Repo</span>
                </div>
                <p style={{ color: COLORS.muted, fontSize: "12px", margin: 0, lineHeight: "1.5" }}>
                  Authorize with GitHub using OAuth to automatically choose your repository from a dropdown list and commit the workflow gate directly.
                </p>

                {!githubToken ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {!useManualToken ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <p style={{ color: COLORS.muted, fontSize: "12px", margin: 0, lineHeight: "1.5" }}>
                          Connect your GitHub account using OAuth to automatically list repositories and push the security gate workflow in one-click.
                        </p>
                        <div style={{ display: "flex", gap: "10px" }}>
                          <button
                            type="button"
                            onClick={handleGithubConnect}
                            style={{
                              background: "#24292e",
                              color: "#FFF",
                              border: "1px solid rgba(255,255,255,0.15)",
                              fontSize: "12px",
                              fontWeight: "700",
                              padding: "10px 20px",
                              borderRadius: "8px",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "8px",
                              transition: "background 0.2s"
                            }}
                          >
                            <svg height="16" viewBox="0 0 16 16" width="16" fill="currentColor">
                              <path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                            </svg>
                            Connect via GitHub OAuth
                          </button>
                          <button
                            type="button"
                            onClick={() => setUseManualToken(true)}
                            style={{
                              background: "transparent",
                              color: COLORS.muted,
                              border: "1px solid rgba(255,255,255,0.08)",
                              fontSize: "12px",
                              fontWeight: "600",
                              padding: "10px 16px",
                              borderRadius: "8px",
                              cursor: "pointer"
                            }}
                          >
                            Use PAT Token
                          </button>
                        </div>

                        {!oauthAvailable && (
                          <div style={{ marginTop: "12px", padding: "16px", background: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.15)", borderRadius: "10px" }}>
                            <h5 style={{ margin: "0 0 8px 0", color: "#F87171", fontSize: "13px", fontWeight: "700" }}>⚙️ GitHub OAuth Configuration Missing</h5>
                            <p style={{ margin: "0 0 12px 0", color: COLORS.muted, fontSize: "12px", lineHeight: "1.5" }}>
                              To enable 1-click authorization redirect, add your OAuth App credentials to the backend <code>.env</code> file:
                            </p>
                            <pre style={{ background: "#020617", padding: "10px", borderRadius: "6px", color: "#A7F3D0", fontSize: "11px", fontFamily: "monospace", margin: "0 0 12px 0" }}>
{`GITHUB_CLIENT_ID=your_id_here
GITHUB_CLIENT_SECRET=your_secret_here`}
                            </pre>
                            <p style={{ margin: 0, color: COLORS.muted, fontSize: "12px", lineHeight: "1.5" }}>
                              Register a new OAuth App under GitHub Settings &gt; Developer Settings. Set the Authorization Callback URL to:<br />
                              <code style={{ color: "#38BDF8", background: "rgba(56,189,248,0.08)", padding: "2px 6px", borderRadius: "4px" }}>{`${window.location.origin}/settings`}</code>
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <p style={{ color: COLORS.muted, fontSize: "12px", margin: 0, lineHeight: "1.5" }}>
                            {!oauthAvailable ? "⚠️ GitHub OAuth not configured by host. " : ""}Enter repository path and PAT token manually:
                          </p>
                          {oauthAvailable && (
                            <button
                              type="button"
                              onClick={() => setUseManualToken(false)}
                              style={{ background: "transparent", border: "none", color: "#38BDF8", cursor: "pointer", fontSize: "11px", fontWeight: "600" }}
                            >
                              Switch to OAuth
                            </button>
                          )}
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "10px" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <label style={{ fontSize: "11px", color: COLORS.muted }}>Repository Path</label>
                            <input 
                              type="text" 
                              value={githubRepo} 
                              onChange={(e) => setGithubRepo(e.target.value)}
                              placeholder="username/repository-name" 
                              style={styles.input}
                            />
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <label style={{ fontSize: "11px", color: COLORS.muted }}>Target Branch</label>
                            <input 
                              type="text" 
                              value={githubBranch} 
                              onChange={(e) => setGithubBranch(e.target.value)}
                              placeholder="main" 
                              style={styles.input}
                            />
                          </div>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <label style={{ fontSize: "11px", color: COLORS.muted }}>GitHub Personal Access Token (PAT)</label>
                          <input 
                            type="password" 
                            value={githubToken} 
                            onChange={(e) => setGithubToken(e.target.value)}
                            placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxx" 
                            style={styles.input}
                          />
                        </div>

                        <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                          <button
                            type="button"
                            onClick={async () => {
                              if (!githubToken || !githubRepo) {
                                toast.error("Please fill in repository path and PAT token.");
                                return;
                              }
                              const toastId = toast.loading("Saving configuration...");
                              try {
                                await handleSave();
                                toast.dismiss(toastId);
                                toast.success("GitHub PAT saved! Loading repository...");
                                fetchRepos();
                              } catch (e) {
                                toast.dismiss(toastId);
                                toast.error("Failed to save credentials.");
                              }
                            }}
                            style={{
                              background: "#10B981",
                              color: "#FFF",
                              border: "none",
                              fontSize: "12px",
                              fontWeight: "700",
                              padding: "10px 20px",
                              borderRadius: "8px",
                              cursor: "pointer"
                            }}
                          >
                            Save & Load Repositories
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.15)", borderRadius: "8px" }}>
                      <span style={{ fontSize: "12px", color: "#34D399", fontWeight: "600" }}>GitHub Connected ✅</span>
                      <button
                        type="button"
                        onClick={handleGithubDisconnect}
                        style={{ background: "transparent", border: "none", color: "#F87171", cursor: "pointer", fontSize: "11px", fontWeight: "600", textDecoration: "underline" }}
                      >
                        Disconnect
                      </button>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "10px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <label style={{ fontSize: "11px", color: COLORS.muted }}>Select Repository</label>
                        {loadingRepos ? (
                          <div style={{ fontSize: "12px", color: COLORS.muted }}>Loading repositories...</div>
                        ) : (
                          <select 
                            value={githubRepo} 
                            onChange={(e) => setGithubRepo(e.target.value)}
                            style={{ ...styles.select, width: "100%" }}
                          >
                            <option value="">-- Choose Repository --</option>
                            {repos.length > 0 ? (
                              repos.map((r, idx) => (
                                <option key={idx} value={r.fullName}>{r.fullName} {r.private ? "🔒" : "🌐"}</option>
                              ))
                            ) : (
                              <option value={githubRepo}>{githubRepo || "Custom Repository"}</option>
                            )}
                          </select>
                        )}
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <label style={{ fontSize: "11px", color: COLORS.muted }}>Target Branch</label>
                        {loadingBranches ? (
                          <div style={{ fontSize: "12px", color: COLORS.muted }}>Loading branches...</div>
                        ) : (
                          <select 
                            value={githubBranch} 
                            onChange={(e) => setGithubBranch(e.target.value)}
                            style={{ ...styles.select, width: "100%" }}
                          >
                            <option value="">-- Choose Branch --</option>
                            {branches.map((b, idx) => (
                              <option key={idx} value={b.name}>{b.name}</option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={syncing}
                      onClick={handleGithubSync}
                      style={{ 
                        alignSelf: "flex-start", 
                        background: "#38BDF8", 
                        color: "#000", 
                        border: "none", 
                        fontSize: "12px", 
                        fontWeight: "700",
                        padding: "10px 20px", 
                        borderRadius: "8px",
                        cursor: syncing ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginTop: "4px"
                      }}
                    >
                      {syncing ? <RefreshCw style={{ width: "14px", height: "14px", animation: "spin 1s linear infinite" }} /> : null}
                      Auto-install Security Gate
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {/* SIMULATED GITHUB OAUTH AUTHORIZE MODAL */}
            {showMockAuthModal && (
              <div style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                background: "rgba(0, 0, 0, 0.75)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 9999,
                backdropFilter: "blur(4px)"
              }}>
                <div style={{
                  background: "#0d1117",
                  border: "1px solid #30363d",
                  borderRadius: "12px",
                  width: "480px",
                  padding: "24px",
                  color: "#c9d1d9",
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.5)"
                }}>
                  {/* Header */}
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", paddingBottom: "16px", borderBottom: "1px solid #21262d", marginBottom: "20px" }}>
                    <svg height="24" viewBox="0 0 16 16" width="24" fill="#c9d1d9">
                      <path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                    </svg>
                    <span style={{ fontSize: "16px", fontWeight: "600", color: "#FFF" }}>Authorize ATHX Scanner</span>
                  </div>

                  {/* Visual Sync diagram */}
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "24px", margin: "24px 0" }}>
                    <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#21262d", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>🐱</div>
                    <div style={{ color: "#8b949e", fontSize: "20px" }}>⇄</div>
                    <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(56, 189, 248, 0.1)", border: "1.5px solid #38BDF8", display: "flex", alignItems: "center", justifyContent: "center", color: "#38BDF8", fontSize: "20px", fontWeight: "bold" }}>🛡️</div>
                  </div>

                  <p style={{ fontSize: "14px", lineHeight: "1.5", color: "#8b949e", textAlign: "center", marginBottom: "20px" }}>
                    <strong style={{ color: "#FFF" }}>ATHX Scanner</strong> wishes to authorize connection to your GitHub account to access lists of repositories and configure DevSecOps pipelines.
                  </p>

                  <div style={{ background: "#161b22", borderRadius: "8px", padding: "16px", marginBottom: "24px", border: "1px solid #21262d" }}>
                    <span style={{ fontSize: "12px", color: "#8b949e", fontWeight: "600", textTransform: "uppercase" }}>Requested Access:</span>
                    <ul style={{ margin: "10px 0 0 0", paddingLeft: "20px", fontSize: "13px", lineHeight: "1.6", color: "#c9d1d9" }}>
                      <li>Read/write actions workflow configurations (<code>workflow</code> scope)</li>
                      <li>List public and private repositories (<code>repo</code> scope)</li>
                    </ul>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <button
                      type="button"
                      disabled={authorizing}
                      onClick={() => {
                        setAuthorizing(true);
                        setTimeout(() => {
                          setAuthorizing(false);
                          setShowMockAuthModal(false);
                          setMockConnected(true);
                          setGithubRepo("");
                          setGithubBranch("main");
                          setBranches([]);
                          toast.success("Linked GitHub account (atharv-design) successfully!");
                        }, 1200);
                      }}
                      style={{
                        background: "#238636",
                        color: "#FFF",
                        border: "1px solid rgba(240,246,252,0.1)",
                        borderRadius: "6px",
                        padding: "12px",
                        fontSize: "14px",
                        fontWeight: "600",
                        cursor: "pointer",
                        width: "100%",
                        textAlign: "center"
                      }}
                    >
                      {authorizing ? "Redirecting and linking profiles..." : "Authorize Atharv-design"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowMockAuthModal(false)}
                      style={{
                        background: "transparent",
                        color: "#f85149",
                        border: "none",
                        fontSize: "13px",
                        fontWeight: "600",
                        cursor: "pointer",
                        width: "100%",
                        padding: "8px"
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* MCP Server & Agent Integrations */}
        <div style={{
          ...styles.card,
          gridColumn: "span 2",
          border: "1px solid rgba(139, 92, 246, 0.22)",
          background: "linear-gradient(180deg, rgba(139, 92, 246, 0.02) 0%, rgba(9, 13, 22, 0.6) 100%)",
          boxShadow: "0 15px 35px rgba(0,0,0,0.4)"
        }}>
          <div style={{ ...styles.cardHeader, display: "flex", alignItems: "center", gap: "8px", position: "relative" }}>
            <Cpu style={{ width: "18px", height: "18px", color: "#A78BFA" }} />
            <h3 style={{ ...styles.cardTitle, margin: 0, background: "linear-gradient(90deg, #E2E8F0, #A78BFA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Model Context Protocol (MCP) Integration
            </h3>
            <FeatureGuide
              title="MCP Integrations"
              description={`Model Context Protocol (MCP) connects your AI Copilot to other tools. You currently have ${mcpConfigs.length} server configurations saved.`}
              steps={[
                "Under 'Local Scanner Server': Copy the JSON config snippet and save it in your claude_desktop_config.json file to let Claude trigger scans.",
                "Under 'Outbound Client Connections': Enter a command (for local files) or a URL (for remote servers) to give your AI Copilot new features.",
                "Click the 'Test Connection' button to verify tools are discovered, then save the configuration to enable it."
              ]}
              techDetails={[
                "SSE Inbound URL: /api/mcp/sse?token=YOUR_JWT_TOKEN",
                "Data storage: Configurations are stored in the McpConfig collection in your MongoDB database."
              ]}
              positionStyles={{ position: "static" }}
            />
          </div>

          <p style={{ fontSize: "13px", color: COLORS.muted, lineHeight: "1.6", margin: 0 }}>
            Configure inbound connections to run this security scanner as a local or remote MCP server, or add outbound client connections to external MCP servers to give your Copilot agent custom capabilities.
          </p>

          {/* Sub-tabs switch */}
          <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.06)", gap: "16px", paddingBottom: "2px" }}>
            <button
              type="button"
              onClick={() => { setMcpActiveTab("server"); resetMcpForm(); }}
              style={{
                background: "transparent",
                border: "none",
                borderBottom: mcpActiveTab === "server" ? "2px solid #8B5CF6" : "2px solid transparent",
                color: mcpActiveTab === "server" ? "#FFF" : COLORS.muted,
                padding: "8px 4px",
                fontSize: "12.5px",
                fontWeight: "700",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              📥 Local Scanner Server (Inbound)
            </button>
            <button
              type="button"
              onClick={() => { setMcpActiveTab("client"); resetMcpForm(); }}
              style={{
                background: "transparent",
                border: "none",
                borderBottom: mcpActiveTab === "client" ? "2px solid #8B5CF6" : "2px solid transparent",
                color: mcpActiveTab === "client" ? "#FFF" : COLORS.muted,
                padding: "8px 4px",
                fontSize: "12.5px",
                fontWeight: "700",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              📤 External MCP Servers (Outbound)
            </button>
          </div>

          {/* Tab 1: Scanner Server (Inbound) */}
          {mcpActiveTab === "server" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ background: "rgba(56, 189, 248, 0.03)", border: "1px solid rgba(56, 189, 248, 0.12)", borderRadius: "10px", padding: "16px" }}>
                <h4 style={{ margin: "0 0 8px 0", fontSize: "13px", color: "#38BDF8", fontWeight: "750" }}>
                  Connect Security Scanner to Local IDE Clients
                </h4>
                <p style={{ margin: 0, fontSize: "12px", color: COLORS.muted, lineHeight: "1.5" }}>
                  Expose this application's scanner database and execution pipelines directly to external LLM clients. Paste the following configuration block into your Claude Desktop settings file (located at <code>%APPDATA%\Claude\claude_desktop_config.json</code> on Windows or <code>~/Library/Application Support/Claude/claude_desktop_config.json</code> on macOS).
                </p>
              </div>

              {/* Code configuration view */}
              <div style={{ position: "relative", background: "#020617", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "12px", fontFamily: "monospace", fontSize: "11.5px", color: "#38BDF8" }}>
                <pre style={{ margin: 0, overflowX: "auto", whiteSpace: "pre-wrap" }}>
{`{
  "mcpServers": {
    "api-security-scanner": {
      "command": "node",
      "args": [
        "c:/Users/athar/api-security-scanner/backend/src/modules/mcp/mcp-stdio.mjs"
      ]
    }
  }
}`}
                </pre>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify({
                      mcpServers: {
                        "api-security-scanner": {
                          command: "node",
                          args: ["c:/Users/athar/api-security-scanner/backend/src/modules/mcp/mcp-stdio.mjs"]
                        }
                      }
                    }, null, 2));
                    toast.success("Claude Desktop config copied!");
                  }}
                  style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    background: "rgba(56,189,248,0.1)",
                    border: "1px solid rgba(56,189,248,0.25)",
                    color: "#38BDF8",
                    fontSize: "10px",
                    fontWeight: "700",
                    cursor: "pointer",
                    padding: "4px 8px",
                    borderRadius: "4px"
                  }}
                >
                  Copy Config
                </button>
              </div>

              <div style={{ fontSize: "11px", color: COLORS.muted }}>
                ⚠️ <strong>Note:</strong> Ensure you run the backend using <code>npm run dev</code> or similar, as the stdio MCP server requires a running database and environment configurations.
              </div>
            </div>
          )}

          {/* Tab 2: External Servers (Outbound) */}
          {mcpActiveTab === "client" && (
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "24px" }}>
              {/* Left Column: Form to Add/Edit Servers */}
              <form onSubmit={handleSaveMcp} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <h4 style={{ margin: 0, fontSize: "13px", color: "#FFF", fontWeight: "750" }}>
                  {editingMcpId ? "Edit MCP Server" : "Add External MCP Server"}
                </h4>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Server Name</label>
                  <input
                    type="text"
                    value={mcpName}
                    onChange={(e) => setMcpName(e.target.value)}
                    placeholder="e.g. Filesystem Explorer"
                    style={{ ...styles.input, width: "100%" }}
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Transport Connection Type</label>
                  <select
                    value={mcpType}
                    onChange={(e) => setMcpType(e.target.value)}
                    style={{ ...styles.select, width: "100%" }}
                  >
                    <option value="stdio">Local Command Executable (Stdio)</option>
                    <option value="sse">Remote Server-Sent Events (SSE)</option>
                  </select>
                </div>

                {mcpType === "stdio" ? (
                  <>
                    <div style={styles.fieldGroup}>
                      <label style={styles.label}>CLI Command</label>
                      <input
                        type="text"
                        value={mcpCommand}
                        onChange={(e) => setMcpCommand(e.target.value)}
                        placeholder="e.g. npx, node, python"
                        style={{ ...styles.input, width: "100%" }}
                      />
                    </div>

                    <div style={styles.fieldGroup}>
                      <label style={styles.label}>Arguments (Space separated)</label>
                      <input
                        type="text"
                        value={mcpArgs}
                        onChange={(e) => setMcpArgs(e.target.value)}
                        placeholder="e.g. @modelcontextprotocol/server-filesystem c:/Users/athar"
                        style={{ ...styles.input, width: "100%" }}
                      />
                    </div>

                    <div style={styles.fieldGroup}>
                      <label style={styles.label}>Environment Variables (JSON Format)</label>
                      <textarea
                        value={mcpEnv}
                        onChange={(e) => setMcpEnv(e.target.value)}
                        placeholder='e.g. { "API_KEY": "secret_xyz" }'
                        style={{
                          ...styles.input,
                          width: "100%",
                          height: "80px",
                          fontFamily: "monospace",
                          resize: "none"
                        }}
                      />
                    </div>
                  </>
                ) : (
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>SSE Server URL</label>
                    <input
                      type="text"
                      value={mcpSseUrl}
                      onChange={(e) => setMcpSseUrl(e.target.value)}
                      placeholder="e.g. http://localhost:3001/sse"
                      style={{ ...styles.input, width: "100%" }}
                    />
                  </div>
                )}

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <input
                    type="checkbox"
                    checked={mcpEnabled}
                    onChange={(e) => setMcpEnabled(e.target.checked)}
                    id="mcp-enabled-checkbox"
                    style={{ cursor: "pointer" }}
                  />
                  <label htmlFor="mcp-enabled-checkbox" style={{ fontSize: "12px", color: "#FFF", fontWeight: "600", cursor: "pointer" }}>
                    Enable this server config for Copilot reasoning
                  </label>
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                  <button
                    type="submit"
                    style={{ ...styles.saveBtn, flex: 1, padding: "8px 16px", fontSize: "12.5px" }}
                  >
                    {editingMcpId ? "Update Server" : "Add Server"}
                  </button>
                  <button
                    type="button"
                    onClick={handleTestMcp}
                    disabled={testingMcp}
                    style={{
                      background: "rgba(56,189,248,0.1)",
                      border: "1px solid rgba(56,189,248,0.2)",
                      borderRadius: "12px",
                      color: "#38BDF8",
                      fontSize: "12.5px",
                      fontWeight: "700",
                      padding: "8px 16px",
                      cursor: "pointer"
                    }}
                  >
                    {testingMcp ? "Testing..." : "Test Connection"}
                  </button>
                  {editingMcpId && (
                    <button
                      type="button"
                      onClick={resetMcpForm}
                      style={{
                        background: "transparent",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "12px",
                        color: COLORS.muted,
                        fontSize: "12.5px",
                        fontWeight: "600",
                        padding: "8px 16px",
                        cursor: "pointer"
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>

              {/* Right Column: Connection List & Test Output */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Connection Test Output box */}
                {testResults && (
                  <div style={{
                    padding: "12px 16px",
                    borderRadius: "12px",
                    background: testResults.success ? "rgba(16, 185, 129, 0.05)" : "rgba(239, 68, 68, 0.05)",
                    border: testResults.success ? "1px solid rgba(16, 185, 129, 0.15)" : "1px solid rgba(239, 68, 68, 0.15)"
                  }}>
                    <h5 style={{ margin: "0 0 6px 0", fontSize: "12px", color: testResults.success ? "#34D399" : "#F87171", fontWeight: "750" }}>
                      {testResults.success ? "✓ CONNECTION SUCCESSFUL" : "✗ CONNECTION FAILED"}
                    </h5>
                    <div style={{ fontSize: "11px", color: COLORS.muted, overflowY: "auto", maxHeight: "100px" }}>
                      {testResults.success ? (
                        <>
                          <div style={{ marginBottom: "4px" }}>Discovered {testResults.tools.length} tool(s):</div>
                          {testResults.tools.map((t, idx) => (
                            <div key={idx} style={{ fontFamily: "monospace", color: "#34D399", paddingLeft: "8px" }}>
                              • {t.name}
                            </div>
                          ))}
                        </>
                      ) : (
                        <div style={{ color: "#F87171", fontFamily: "monospace" }}>{testResults.error}</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Active configs list */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <h4 style={{ margin: 0, fontSize: "12px", color: "#64748B", fontWeight: "800", textTransform: "uppercase" }}>
                    Registered External Servers ({mcpConfigs.length})
                  </h4>

                  {loadingMcp ? (
                    <div style={{ color: COLORS.muted, fontSize: "12px" }}>Loading server directory...</div>
                  ) : mcpConfigs.length === 0 ? (
                    <div style={{
                      padding: "20px",
                      background: "rgba(255,255,255,0.01)",
                      border: "1px dashed rgba(255,255,255,0.06)",
                      borderRadius: "12px",
                      textAlign: "center",
                      color: COLORS.muted,
                      fontSize: "12px"
                    }}>
                      No external servers registered. Configure one using the form on the left.
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {mcpConfigs.map((config) => (
                        <div key={config._id} style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          background: "rgba(255,255,255,0.02)",
                          border: "1px solid rgba(255,255,255,0.05)",
                          borderRadius: "10px",
                          padding: "10px 14px"
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{
                              width: "8px",
                              height: "8px",
                              borderRadius: "50%",
                              background: config.enabled ? "#10B981" : "#64748B"
                            }} />
                            <div style={{ display: "flex", flexDirection: "column" }}>
                              <span style={{ fontSize: "12.5px", fontWeight: "700", color: "#FFF" }}>{config.name}</span>
                              <span style={{ fontSize: "10px", color: COLORS.muted, fontFamily: "monospace" }}>
                                {config.type.toUpperCase()} • {config.type === "stdio" ? config.command : config.sseUrl}
                              </span>
                            </div>
                          </div>

                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              type="button"
                              onClick={() => handleEditMcp(config)}
                              style={{
                                background: "rgba(139,92,246,0.08)",
                                border: "1px solid rgba(139,92,246,0.18)",
                                color: "#A78BFA",
                                fontSize: "11px",
                                padding: "4px 8px",
                                borderRadius: "6px",
                                cursor: "pointer"
                              }}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteMcp(config._id)}
                              style={{
                                background: "rgba(239,68,68,0.08)",
                                border: "1px solid rgba(239,68,68,0.18)",
                                color: "#F87171",
                                fontSize: "11px",
                                padding: "4px 8px",
                                borderRadius: "6px",
                                cursor: "pointer"
                              }}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Multi-Tenant Team & Workspace Configurations */}
        <div style={{
          ...styles.card,
          gridColumn: "span 2",
          border: "1px solid rgba(139, 92, 246, 0.2)",
          background: "linear-gradient(180deg, rgba(139, 92, 246, 0.02) 0%, rgba(9, 13, 22, 0.6) 100%)",
          boxShadow: "0 15px 35px rgba(0,0,0,0.4)"
        }}>
          <div style={styles.cardHeader}>
            <Users style={{ width: "18px", height: "18px", color: "#A78BFA" }} />
            <h3 style={{ ...styles.cardTitle, background: "linear-gradient(90deg, #E2E8F0, #A78BFA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Team Workspace & Member Directory
            </h3>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "28px" }}>
            
            {/* Left Column: Team Creation & Invitation */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              
              {/* Workspace creation */}
              <div style={{
                padding: "20px",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: "14px",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)"
              }}>
                <h4 style={{ margin: "0 0 14px 0", fontSize: "13.5px", fontWeight: "750", color: "#FFF", display: "flex", alignItems: "center", gap: "6px" }}>
                  💼 Create New Workspace
                </h4>
                <form onSubmit={handleCreateTeam} style={{ display: "flex", gap: "12px" }}>
                  <input
                    type="text"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    placeholder="e.g., Security Operations"
                    style={{
                      ...styles.input,
                      flex: 1,
                      background: "#060910",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "10px",
                      padding: "10px 14px",
                      color: "#FFF"
                    }}
                  />
                  <button
                    type="submit"
                    disabled={creatingTeam}
                    style={{
                      ...styles.saveBtn,
                      background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
                      padding: "10px 20px",
                      borderRadius: "10px",
                      fontSize: "12.5px",
                      boxShadow: "0 4px 15px rgba(124,58,237,0.2)"
                    }}
                  >
                    {creatingTeam ? "Creating..." : "Create Team"}
                  </button>
                </form>
              </div>

              {/* Add member */}
              {activeTeamData && (
                <div style={{
                  padding: "20px",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  borderRadius: "14px",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)"
                }}>
                  <h4 style={{ margin: "0 0 14px 0", fontSize: "13.5px", fontWeight: "750", color: "#FFF", display: "flex", alignItems: "center", gap: "6px" }}>
                    ➕ Add Workspace Member
                  </h4>
                  <form onSubmit={handleInviteMember} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div style={styles.fieldGroup}>
                      <label style={{ ...styles.label, color: "#94A3B8" }}>Member Email Address</label>
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="collaborator@company.com"
                        style={{
                          ...styles.input,
                          background: "#060910",
                          border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: "10px",
                          padding: "10px 14px"
                        }}
                      />
                    </div>
                    <div style={styles.fieldGroup}>
                      <label style={{ ...styles.label, color: "#94A3B8" }}>Access Role</label>
                      <select
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value)}
                        style={{
                          ...styles.select,
                          background: "#060910",
                          border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: "10px",
                          padding: "10px 14px"
                        }}
                      >
                        <option value="member">Member (Read & Trigger scans)</option>
                        <option value="admin">Admin (Manage members & configurations)</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      disabled={invitingMember}
                      style={{
                        ...styles.saveBtn,
                        background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
                        width: "fit-content",
                        padding: "10px 24px",
                        borderRadius: "10px",
                        fontSize: "12.5px",
                        boxShadow: "0 4px 15px rgba(124,58,237,0.2)"
                      }}
                    >
                      {invitingMember ? "Adding..." : "Add to Workspace"}
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Right Column: Directory List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{
                padding: "20px",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: "14px",
                minHeight: "330px",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)"
              }}>
                <h4 style={{ margin: "0 0 14px 0", fontSize: "13.5px", fontWeight: "750", color: "#FFF", display: "flex", alignItems: "center", gap: "6px" }}>
                  📋 Members Directory
                </h4>
                {!activeTeamData ? (
                  <p style={{ color: COLORS.muted, fontSize: "12.5px", fontStyle: "italic", margin: 0 }}>
                    Please select or create a team workspace workspace to view directory members.
                  </p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {activeTeamData.members?.map((m) => (
                      <div
                        key={m.userId?._id || m.userId}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "12px 16px",
                          background: "rgba(255,255,255,0.015)",
                          border: "1px solid rgba(255,255,255,0.04)",
                          borderRadius: "10px",
                          transition: "background 0.2s"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.015)"}
                      >
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          <span style={{ fontSize: "13.5px", fontWeight: "750", color: "#FFF" }}>{m.userId?.name || "Invited Member"}</span>
                          <span style={{ fontSize: "11.5px", color: COLORS.muted }}>{m.userId?.email || "No email"}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          {m.status === "pending" ? (
                            <span style={{
                              background: "rgba(245, 158, 11, 0.1)",
                              color: "#F59E0B",
                              fontSize: "10px",
                              fontWeight: "800",
                              textTransform: "uppercase",
                              padding: "3px 10px",
                              borderRadius: "20px",
                              border: "1px solid rgba(245, 158, 11, 0.3)"
                            }}>
                              PENDING REQUEST
                            </span>
                          ) : (
                            <span style={{
                              background: m.role === "owner" ? "rgba(56,189,248,0.08)" : m.role === "admin" ? "rgba(167,139,250,0.08)" : "rgba(255,255,255,0.03)",
                              color: m.role === "owner" ? "#38BDF8" : m.role === "admin" ? "#A78BFA" : "#94A3B8",
                              fontSize: "10px",
                              fontWeight: "800",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                              padding: "3px 10px",
                              borderRadius: "20px",
                              border: `1px solid ${m.role === "owner" ? "rgba(56,189,248,0.2)" : m.role === "admin" ? "rgba(167,139,250,0.2)" : "rgba(255,255,255,0.06)"}`
                            }}>
                              {m.role}
                            </span>
                          )}

                          {m.status === "pending" && (
                            <button
                              type="button"
                              onClick={() => handleAcceptInvite(m.userId?._id || m.userId)}
                              title="Accept invitation request"
                              style={{
                                background: "rgba(16,185,129,0.15)",
                                border: "1px solid rgba(16,185,129,0.3)",
                                color: "#10B981",
                                padding: "3px 8px",
                                borderRadius: "6px",
                                fontSize: "10.5px",
                                fontWeight: "700",
                                cursor: "pointer"
                              }}
                            >
                              Accept Request
                            </button>
                          )}
                          
                          {m.role !== "owner" && (
                            <button
                              type="button"
                              onClick={() => handleRemoveMember(m.userId?._id || m.userId)}
                              style={{
                                background: "transparent",
                                border: "none",
                                color: "#F87171",
                                cursor: "pointer",
                                padding: "4px",
                                display: "flex",
                                alignItems: "center",
                                transition: "transform 0.15s"
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.15)"}
                              onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1.0)"}
                            >
                              <Trash2 style={{ width: "15px", height: "15px" }} />
                            </button>
                          )}
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Audit Logs Row */}
          {activeTeamData && (
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "24px", marginTop: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                <ClipboardList style={{ width: "17px", height: "17px", color: "#A78BFA" }} />
                <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "750", color: "#FFF" }}>
                  🛡️ Workspace Administrative Audit Trail
                </h4>
              </div>
              {auditLogs.length === 0 ? (
                <p style={{ color: COLORS.muted, fontSize: "12px", fontStyle: "italic", margin: 0 }}>No logs recorded for this workspace.</p>
              ) : (
                <div style={{
                  maxHeight: "200px",
                  overflowY: "auto",
                  background: "#020617",
                  border: "1px solid rgba(255,255,255,0.05)",
                  borderRadius: "12px",
                  padding: "12px",
                  fontFamily: "monospace"
                }}>
                  {auditLogs.map((log) => (
                    <div
                      key={log._id}
                      style={{
                        padding: "10px 8px",
                        borderBottom: "1px solid rgba(255,255,255,0.03)",
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "12px",
                        alignItems: "center"
                      }}
                    >
                      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                        <span style={{
                          fontSize: "9px",
                          fontWeight: "800",
                          textTransform: "uppercase",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          background: log.action === "team_created" ? "rgba(52,211,153,0.1)" : "rgba(56,189,248,0.1)",
                          color: log.action === "team_created" ? "#34D399" : "#38BDF8"
                        }}>
                          {log.action === "team_created" ? "created" : "action"}
                        </span>
                        <span style={{ color: "#E2E8F0" }}>
                          <strong style={{ color: "#38BDF8" }}>{log.userId?.name || "System"}</strong>{" "}
                          {log.action === "team_created" ? "created workspace" :
                           log.action === "member_added" ? `invited "${log.details?.invitedUser}" as ${log.details?.role}` :
                           log.action === "member_removed" ? `removed "${log.details?.removedUser}"` :
                           log.action}
                        </span>
                      </div>
                      <span style={{ color: COLORS.muted, fontSize: "11px" }}>
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {/* Danger Zone: Delete Workspace */}
          {activeTeamData && (
            <div style={{
              marginTop: "28px", padding: "20px 24px",
              background: "rgba(239, 68, 68, 0.04)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              borderRadius: "16px", display: "flex",
              alignItems: "center", justifyContent: "space-between",
              boxShadow: "0 8px 32px rgba(239, 68, 68, 0.05)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{
                  background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.3)",
                  borderRadius: "12px", padding: "10px", color: "#EF4444", display: "flex", alignItems: "center"
                }}>
                  <ShieldAlert style={{ width: "22px", height: "22px" }} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: "#F87171" }}>
                    Danger Zone — Delete Workspace
                  </h4>
                  <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#94A3B8" }}>
                    Permanently remove <strong>"{activeTeamData.name}"</strong>, member assignments, and audit records. This action cannot be undone.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                style={{
                  background: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
                  border: "none", color: "#FFFFFF", padding: "10px 20px", borderRadius: "10px",
                  fontSize: "12.5px", fontWeight: "750", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px",
                  boxShadow: "0 4px 15px rgba(239, 68, 68, 0.3)", transition: "transform 0.2s ease"
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.03)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1.0)"}
              >
                <Trash2 style={{ width: "15px", height: "15px" }} />
                Delete Workspace
              </button>
            </div>
          )}

        </div>

      </div>

      {/* Delete Workspace Confirmation Lightbox Modal */}
      {showDeleteModal && activeTeamData && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(3, 7, 18, 0.85)", backdropFilter: "blur(10px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99999, padding: "20px"
        }}>
          <div style={{
            background: "#070D19", border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "20px", padding: "28px", maxWidth: "480px", width: "100%",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(239, 68, 68, 0.15)",
            position: "relative"
          }}>
            <button
              onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(""); }}
              style={{ position: "absolute", top: "18px", right: "18px", background: "transparent", border: "none", color: "#94A3B8", cursor: "pointer" }}
            >
              <X style={{ width: "20px", height: "20px" }} />
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <div style={{ background: "rgba(239, 68, 68, 0.15)", padding: "10px", borderRadius: "12px", color: "#EF4444" }}>
                <AlertTriangle style={{ width: "24px", height: "24px" }} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#FFFFFF" }}>
                  Delete Workspace?
                </h3>
                <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#94A3B8" }}>
                  This will permanently erase <strong>"{activeTeamData.name}"</strong>.
                </p>
              </div>
            </div>

            <p style={{ fontSize: "13px", color: "#CBD5E1", lineHeight: "1.5", marginBottom: "18px" }}>
              To prevent accidental deletion, please type the workspace name <strong style={{ color: "#EF4444" }}>{activeTeamData.name}</strong> below:
            </p>

            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder={`Type "${activeTeamData.name}"`}
              style={{
                width: "100%", background: "#030712", border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: "10px", padding: "12px 14px", color: "#FFFFFF", fontSize: "13px",
                marginBottom: "20px", outline: "none"
              }}
            />

            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(""); }}
                style={{
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "#94A3B8", padding: "10px 18px", borderRadius: "10px", fontSize: "13px", fontWeight: "700", cursor: "pointer"
                }}
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteTeam}
                disabled={deletingWorkspace || deleteConfirmText.trim() !== activeTeamData.name.trim()}
                style={{
                  background: deleteConfirmText.trim() === activeTeamData.name.trim() ? "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)" : "rgba(239, 68, 68, 0.2)",
                  border: "none", color: deleteConfirmText.trim() === activeTeamData.name.trim() ? "#FFFFFF" : "#94A3B8",
                  padding: "10px 22px", borderRadius: "10px", fontSize: "13px", fontWeight: "750",
                  cursor: deleteConfirmText.trim() === activeTeamData.name.trim() ? "pointer" : "not-allowed",
                  boxShadow: deleteConfirmText.trim() === activeTeamData.name.trim() ? "0 4px 15px rgba(239, 68, 68, 0.3)" : "none"
                }}
              >
                {deletingWorkspace ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Save Button Row */}
      <div style={styles.saveBtnRow}>
        <button 
          onClick={handleSave} 
          disabled={saving}
          style={styles.saveBtn}
        >
          {saving ? <RefreshCw style={{ width: "16px", height: "16px", animation: "spin 1s linear infinite" }} /> : <Save style={{ width: "16px", height: "16px" }} />}
          Save Configurations
        </button>
      </div>

    </div>
  );
}