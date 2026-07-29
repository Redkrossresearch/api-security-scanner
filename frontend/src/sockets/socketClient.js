import { io } from "socket.io-client";

const getSocketURL = () => {
  if (import.meta.env.VITE_SOCKET_URL) return import.meta.env.VITE_SOCKET_URL;
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL.replace("/api", "");
  if (typeof window !== "undefined" && window.location.hostname.includes("vercel.app")) {
    return "https://api-security-scanner-puum.onrender.com";
  }
  return "http://localhost:5000";
};

const SOCKET_URL = getSocketURL();

const isVercel = typeof window !== "undefined" && window.location.hostname.includes("vercel.app");

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  auth: (cb) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    cb({ token });
  },
  reconnection: !isVercel,
  reconnectionAttempts: isVercel ? 0 : 5,
  reconnectionDelay: 3000,
  reconnectionDelayMax: 10000,
  timeout: 10000,
});

export default socket;
