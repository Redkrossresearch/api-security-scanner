import { useEffect } from "react";
import useSocket from "./useSocket";

export const useScanRoom = (scanId) => {
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket || !scanId) return;

    if (isConnected) {
      socket.emit("scan:join", { scanId });
    }

    const onConnect = () => {
      socket.emit("scan:join", { scanId });
    };

    socket.on("connect", onConnect);

    return () => {
      socket.off("connect", onConnect);
      if (socket.connected) {
        socket.emit("scan:leave", { scanId });
      }
    };
  }, [scanId, socket, isConnected]);
};

export default useScanRoom;
