import WebSocket, { WebSocketServer, type Data } from "ws";
import { chatQueue } from "../ws/queues/chat.queue.ts";
import type { Request, Response } from "express";
import { db } from "../db/setup.ts";
import type { RedisClient } from "bullmq";


interface handleIncomingMessagesI {
  ws: WebSocket,
  data: Data,
  clients: Map<WebSocket, { id: string, slug?: string }>,
  socket: WebSocketServer,
  publisher: RedisClient
}

interface chatMessage {
  type: 'join_room' | 'message',
  slug: string,
  message?: string
}

export const handleIncomingMessages = async ({ ws, data, clients, socket, publisher }: handleIncomingMessagesI) => {
  const parsedData: chatMessage = JSON.parse(data.toString());

  const { type, slug, message } = parsedData;

  if (type === 'join_room' && slug) {
    const clientData = clients.get(ws);
    if (clientData) {
      clientData.slug = slug;
    }
    console.log(`Client ${clientData?.id} has joined room: ${clientData?.slug}`)
    return;
  } else if (type === 'message' && slug) {

    console.log(`Received Message ${message} for room ${slug}`);
    const clientData = clients.get(ws);

    if (!clientData) {
      console.error("Client data not found in map.");
      return;
    }

    if (!message) {
      console.error('message required');
      return;
    }
    try {
      await publisher.publish('COMPUTE_UPDATES', JSON.stringify({
        slug,
        userId: clientData?.id,
        message
      }))
      await chatQueue.add('save-message', {
        userId: clientData.id,
        roomId: slug,
        message,
      });
    } catch (error) {
      console.error("Error: ", error);
    }
  }
}

export const loadMessages = async (req: Request, res: Response) => {
  const { slug } = req.params;
  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({
      error: "Enter valid roomId"
    });
  }
  const room = await db.query.rooms.findFirst({
    where: (rooms, { eq }) => eq(rooms.slug, slug),
  });

  if (!room) {
    return res.status(404).json({ error: "Room not found" });
  }


  const messages = await db.query.messages.findMany({
    where: (messages, { eq }) => eq(messages.roomId, room.id),
    orderBy: (messages, { asc }) => asc(messages.id),
    limit: 50
  });

  if (!messages) {
    return res.status(500).json({
      error: "Unable to fetch messages. Please try again later."
    });
  }

  return res.json(messages);
}