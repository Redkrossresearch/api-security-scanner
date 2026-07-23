import React, { useState, useEffect } from "react";
import { socket } from "./socketClient";
import SocketContext from "./SocketContext";
import { useAuth } from "../contexts/AuthContext";

export const SocketProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [latency, setLatency] = useState(0);

  useEffect(() => {
    const isVercel = typeof window !== "undefined" && window.location.hostname.includes("vercel.app");
    if (isVercel) {
      console.warn("[SocketProvider] Disabling WebSockets on serverless Vercel host.");
      setIsConnected(false);
      return;
    }

    const token = localStorage.getItem("token");
    if (currentUser && token) {
      socket.auth = { token };
      socket.connect();
    } else {
      socket.disconnect();
    }

    const onConnect = () => {
      setIsConnected(true);
      console.log("[SocketProvider] Connected to server successfully");
    };

    const onDisconnect = (reason) => {
      setIsConnected(false);
      setLatency(0);
      console.log(`[SocketProvider] Disconnected: ${reason}`);
    };

    const onConnectError = (err) => {
      setIsConnected(false);
      setLatency(0);
      console.warn("[SocketProvider] Connection warning:", err.message);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);

    
    // Listen to system:heartbeat to compute latency
    socket.on("system:heartbeat", (data) => {
      if (data && data.ts) {
        const ping = Date.now() - new Date(data.ts).getTime();
        setLatency(Math.max(0, ping));
      }
    });

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("system:heartbeat");
    };
  }, [currentUser]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, latency }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
