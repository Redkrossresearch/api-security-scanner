import api from "./api";

export const getSettings = async () => {
  const res = await api.get("/settings");
  return res.data.settings;
};

export const updateSettings = async (settingsData) => {
  const res = await api.put("/settings", settingsData);
  return res.data.settings;
};
