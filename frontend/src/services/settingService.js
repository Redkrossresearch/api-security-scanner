import api from "./api";

export const getSettings = async () => {
  const res = await api.get("/settings");
  return res.data.settings;
};

export const updateSettings = async (settingsData) => {
  const res = await api.put("/settings", settingsData);
  return res.data.settings;
};

export const syncGithubWorkflow = async (syncData) => {
  const res = await api.post("/settings/github/sync", syncData);
  return res.data;
};

export const getGithubClientId = async () => {
  const res = await api.get("/settings/github/client-id");
  return res.data;
};

export const handleGithubCallback = async (code) => {
  const res = await api.post("/settings/github/callback", { code });
  return res.data;
};

export const getGithubRepos = async () => {
  const res = await api.get("/settings/github/repos");
  return res.data.repos;
};

export const disconnectGithub = async () => {
  const res = await api.delete("/settings/github/disconnect");
  return res.data;
};

export const getGithubBranches = async (repo) => {
  const res = await api.get("/settings/github/branches", { params: { repo } });
  return res.data.branches;
};

export const syncGitlabWorkflow = async () => {
  const res = await api.post("/settings/gitlab/sync");
  return res.data;
};
