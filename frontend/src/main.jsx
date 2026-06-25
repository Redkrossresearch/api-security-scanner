import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@fontsource/inter";

import "./index.css";
import "./styles/scrollbar.css";
import "./styles/markdown.css";

import App from "./App.jsx";
import { AuthProvider } from "./contexts/AuthContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);