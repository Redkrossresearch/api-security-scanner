import { useEffect, useRef } from "react";
import useSocket from "./useSocket";

export const useSocketEvent = (eventName, handler) => {
  const { socket } = useSocket();
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!socket) return;

    const eventListener = (...args) => {
      if (handlerRef.current) {
        handlerRef.current(...args);
      }
    };

    socket.on(eventName, eventListener);

    return () => {
      socket.off(eventName, eventListener);
    };
  }, [eventName, socket]);
};

export default useSocketEvent;
