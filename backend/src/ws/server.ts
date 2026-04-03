import type { Server } from 'http';
import WebSocket, { WebSocketServer } from "ws";
import { handleIncomingMessages, handleClientLeave } from "../controllers/message.controller.ts";
import { createPublisher, createSubscriber } from "./redis.ts";

const publisher = createPublisher();
const subscriber = createSubscriber();

const clients = new Map<WebSocket, { id: string; slug?: string; name?: string }>();

subscriber.subscribe('COMPUTE_UPDATES', (err) => {
  if (err) console.error('Failed to subscribe to Redis:', err);
});

subscriber.on("message", (channel, chatMessage) => {
  if (channel === "COMPUTE_UPDATES") {
    const { type = "message", message, userId, senderName, slug, userCount } = JSON.parse(chatMessage);

    clients.forEach((clientData, ws) => {
      if (
        clientData.slug === slug &&
        ws.readyState === WebSocket.OPEN
      ) {
        ws.send(
          JSON.stringify({ type, slug, userId, senderName, message, userCount })
        );
      }
    });
  }
});

export const setupWs = (server: Server) => {
  const socket = new WebSocketServer({ server });


  socket.on('connection', (ws) => {
    const clientId = Math.random().toString(36).substring(2, 15);
    clients.set(ws, { id: clientId });

    ws.on("error", console.error);

    ws.on("message", async (data) => {
      console.log("Message received:", data.toString());
      try {
        await handleIncomingMessages({ ws, data, clients, socket, publisher });
      } catch (error) {
        console.error("Error:", error);
      }
    });

    ws.on("close", async () => {
      const clientData = clients.get(ws);
      console.log(`Client ${clientData?.id} (${clientData?.name ?? "anon"}) disconnected.`);
      if (clientData?.slug) {
        await handleClientLeave(clientData.slug, publisher, clientData);
      }
      clients.delete(ws);
    });

    ws.send(JSON.stringify({ type: "welcome", id: clientId }));
  });
};