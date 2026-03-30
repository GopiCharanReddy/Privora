import WebSocket, { WebSocketServer, type Data } from "ws";
import { chatQueue } from "../ws/queues/chat.queue.ts";
import type { Request, Response } from "express";
import { db } from "../db/setup.ts";
import type { RedisClient } from "bullmq";

interface handleIncomingMessagesI {
  ws: WebSocket;
  data: Data;
  clients: Map<WebSocket, { id: string; slug?: string; name?: string }>;
  socket: WebSocketServer;
  publisher: RedisClient;
}

interface chatMessage {
  type: "join_room" | "message";
  slug: string;
  message?: string;
  name?: string;
}

export const handleIncomingMessages = async ({
  ws,
  data,
  clients,
  socket,
  publisher,
}: handleIncomingMessagesI) => {
  const parsedData: chatMessage = JSON.parse(data.toString());
  const { type, slug, message, name } = parsedData;

  if (type === "join_room" && slug) {
    const clientData = clients.get(ws);
    if (clientData) {
      clientData.slug = slug;
      if (name) clientData.name = name;
    }
    console.log(
      `Client ${clientData?.id} (${clientData?.name ?? "anon"}) has joined room: ${slug}`
    );
    return;
  }

  if (type === "message" && slug && message) {
    console.log(`Received message "${message}" for room ${slug}`);
    const clientData = clients.get(ws);

    if (!clientData) {
      console.error("Client data not found in map.");
      return;
    }

    const senderName = clientData.name ?? "Anonymous";

    try {
      await publisher.publish('COMPUTE_UPDATES', JSON.stringify({
        slug,
        userId: clientData.id,
        senderName,
        message,
      })
      );

      await chatQueue.add("save-message", {
        roomId: slug,
        senderName,
        message,
      });
    } catch (error) {
      console.error("Error: ", error);
    }
  }
};

export const loadMessages = async (req: Request, res: Response) => {
  const { slug } = req.params;

  if (!slug || typeof slug !== "string") {
    return res.status(400).json({ error: "Enter valid roomId" });
  }

  const room = await db.query.rooms.findFirst({
    where: (rooms, { eq }) => eq(rooms.slug, slug),
  });

  if (!room) {
    return res.status(404).json({ error: "Room not found" });
  }

  if (room.isDeleted) {
    return res.status(410).json({ error: "Room has been deleted" });
  }

  const messages = await db.query.messages.findMany({
    where: (messages, { eq }) => eq(messages.roomId, room.id),
    orderBy: (messages, { asc }) => asc(messages.id),
    limit: 50,
  });

  return res.json(messages);
};