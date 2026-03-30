"use client";

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";

export interface WsMessage {
  type: string;
  slug?: string;
  userId?: string;
  message?: string;
  messageId?: number;
  isDeleted?: boolean;
  [key: string]: unknown;
}

type WebSocketContextType = {
  socket: WebSocket | null;
  isConnected: boolean;
  clientId: string | null;
  lastMessage: WsMessage | null;
  sendMessage: (payload: object) => void;
};

const WebSocketContext = createContext<WebSocketContextType>({
  socket: null,
  isConnected: false,
  clientId: null,
  lastMessage: null,
  sendMessage: () => { },
});

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState<WsMessage | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8080";
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("[WS] Connected");
      setIsConnected(true);
      setSocket(ws);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as WsMessage;
        setLastMessage(data);
        if (data.type === "welcome" && data.id) {
          setClientId(data.id as string);
        }
      } catch {
        // non-JSON message (e.g. "Websocket connection successful.")
      }
    };

    ws.onclose = () => {
      console.log("[WS] Disconnected");
      setIsConnected(false);
    };

    ws.onerror = (err) => {
      console.log("[WS] Error", err);
    };

    return () => {
      ws.close();
    };
  }, []);

  const sendMessage = useCallback((payload: object) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(payload));
    }
  }, []);

  return (
    <WebSocketContext.Provider value={{ socket, isConnected, clientId, lastMessage, sendMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export default WebSocketContext;