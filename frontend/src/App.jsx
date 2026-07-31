// App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import MainLayout from "./layouts/MainLayout";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./routes/ProtectedRoute";

import DashboardPage from "./pages/DashboardPage";
import ScanExecutionPage from "./pages/ScanExecutionPage";
import ScanHistoryPage from "./pages/ScanHistoryPage";
import VulnerabilitiesPage from "./pages/VulnerabilitiesPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import CopilotPage from "./pages/CopilotPage";
import QueueMonitorPage from "./pages/QueueMonitorPage";
import WorkspacePage from "./pages/WorkspacePage";
import DownloadsPage from "./pages/DownloadsPage";
import ApiInventoryPage from "./pages/ApiInventoryPage";

import { useEffect } from "react";

function App() {
  useEffect(() => {
    function applyGlobalSettings() {
      const theme = localStorage.getItem("athx_settings_theme") || "dark_midnight";
      const accent = localStorage.getItem("athx_settings_accent") || "#F97316";
      const compact = localStorage.getItem("athx_settings_compact") === "true";

      document.documentElement.setAttribute("data-theme", theme);
      document.documentElement.style.setProperty("--brand-accent", accent);
      if (compact) {
        document.body.classList.add("compact-density");
      } else {
        document.body.classList.remove("compact-density");
      }
    }
    applyGlobalSettings();
    window.addEventListener("athx-settings-updated", applyGlobalSettings);
    return () => window.removeEventListener("athx-settings-updated", applyGlobalSettings);
  }, []);

  return (
    <BrowserRouter>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<DashboardPage />} />
          <Route path="/scans" element={<ScanExecutionPage />} />
          <Route path="/history" element={<ScanHistoryPage />} />
          <Route path="/vulnerabilities" element={<VulnerabilitiesPage />} />
          <Route path="/inventory" element={<ApiInventoryPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/copilot" element={<CopilotPage />} />
          <Route path="/workspace" element={<WorkspacePage />} />
          <Route path="/downloads" element={<DownloadsPage />} />
          <Route path="/queue" element={<QueueMonitorPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}


export default App;