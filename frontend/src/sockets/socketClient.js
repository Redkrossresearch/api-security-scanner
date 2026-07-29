import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 
  (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace("/api", "") : "http://localhost:5000");

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
