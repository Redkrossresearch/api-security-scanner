import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

if (typeof window !== "undefined" && "history" in window && "scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}
if (typeof window !== "undefined") {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

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