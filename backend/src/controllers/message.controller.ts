import WebSocket, { WebSocketServer, type Data } from "ws"
import { chatQueue } from "../ws/queues/chat.queue.ts"
import type { Request, Response } from "express"
import { db } from "../db/setup.ts"
import type { RedisClient } from "bullmq"
import { sql, eq, and } from "drizzle-orm"
import { rooms, users } from "../db/schema.ts"

interface handleIncomingMessagesI {
  ws: WebSocket
  data: Data
  clients: Map<
    WebSocket,
    { id: string; slug?: string; name?: string; dbUserId?: number }
  >
  socket: WebSocketServer
  publisher: RedisClient
}

interface chatMessage {
  type: "join_room" | "message" | "typing"
  slug: string
  message?: string
  name?: string
}

export const handleIncomingMessages = async ({
  ws,
  data,
  clients,
  socket,
  publisher,
}: handleIncomingMessagesI) => {
  const parsedData: chatMessage = JSON.parse(data.toString())
  const { type, slug, message, name } = parsedData

  if (type === "join_room" && slug) {
    const clientData = clients.get(ws)

    let dbUserId: number | undefined
    if (name) {
      let userRecord = await db.query.users.findFirst({
        where: (u, { eq }) => eq(u.name, name),
      })
      if (!userRecord) {
        const inserted = await db
          .insert(users)
          .values({ name })
          .returning({ id: users.id })
        if (!inserted || inserted.length === 0)
          throw new Error("Failed to create user")
        dbUserId = inserted[0]?.id!
      } else {
        dbUserId = userRecord.id
      }
    }

    if (clientData) {
      clientData.slug = slug
      if (name) clientData.name = name
      if (dbUserId) clientData.dbUserId = dbUserId
    }
    console.log(
      `Client ${clientData?.id} (${clientData?.name ?? "anon"}) has joined room: ${slug}`
    )

    // Increment room user count in DB
    try {
      const updatedRooms = await db
        .update(rooms)
        .set({ count: sql`${rooms.count} + 1` })
        .where(and(eq(rooms.slug, slug), eq(rooms.isDeleted, false)))
        .returning({ count: rooms.count })

      const newCount = updatedRooms[0]?.count ?? 0

      await publisher.publish(
        "COMPUTE_UPDATES",
        JSON.stringify({
          type: "user_joined",
          slug,
          userId: clientData?.id,
          senderName: "System",
          message: `${name ?? "Anonymous"} joined the room`,
          userCount: newCount,
        })
      )
    } catch (err) {
      console.error("[join_room] Failed to increment room count:", err)
    }
    return
  }

  if (type === "typing" && slug) {
    const clientData = clients.get(ws)
    if (!clientData) return
    try {
      await publisher.publish(
        "COMPUTE_UPDATES",
        JSON.stringify({
          type: "typing",
          slug,
          userId: clientData.id,
          senderName: clientData.name ?? "Anonymous",
        })
      )
    } catch (error) {
      console.error("Error: ", error)
    }
    return
  }

  if (type === "message" && slug && message) {
    console.log(`Received message "${message}" for room ${slug}`)
    const clientData = clients.get(ws)

    if (!clientData) {
      console.error("Client data not found in map.")
      return
    }

    const senderName = clientData.name ?? "Anonymous"

    try {
      await publisher.publish(
        "COMPUTE_UPDATES",
        JSON.stringify({
          type: "message",
          slug,
          userId: clientData.id,
          senderName,
          message,
        })
      )

      await chatQueue.add("save-message", {
        roomId: slug,
        senderName,
        message,
        userId: clientData.dbUserId,
      })
    } catch (error) {
      console.error("Error: ", error)
    }
  }
}

export const handleClientLeave = async (
  slug: string,
  publisher: RedisClient,
  clientData: { id: string; name?: string }
): Promise<void> => {
  try {
    // Decrement count, but never go below 0
    const updatedRooms = await db
      .update(rooms)
      .set({ count: sql`GREATEST(${rooms.count} - 1, 0)` })
      .where(and(eq(rooms.slug, slug), eq(rooms.isDeleted, false)))
      .returning({ count: rooms.count })

    const newCount = updatedRooms[0]?.count ?? 0

    await publisher.publish(
      "COMPUTE_UPDATES",
      JSON.stringify({
        type: "user_left",
        slug,
        userId: clientData.id,
        senderName: "System",
        message: `${clientData.name ?? "Anonymous"} left the room`,
        userCount: newCount,
      })
    )

    // Re-fetch to check if the room is now empty
    const room = await db.query.rooms.findFirst({
      where: (r, { eq: eqFn }) => eqFn(r.slug, slug),
    })

    if (room && !room.isDeleted && (room.count ?? 0) <= 0) {
      await db
        .update(rooms)
        .set({ isDeleted: true })
        .where(and(eq(rooms.slug, slug), eq(rooms.isDeleted, false)))
      console.log(`[room] Room "${slug}" is now empty — marked as deleted.`)
    }
  } catch (err) {
    console.error("[leave_room] Failed to update room on disconnect:", err)
  }
}

export const loadMessages = async (req: Request, res: Response) => {
  const { slug } = req.params

  if (!slug || typeof slug !== "string") {
    return res.status(400).json({ error: "Enter valid roomId" })
  }

  const room = await db.query.rooms.findFirst({
    where: (rooms, { eq }) => eq(rooms.slug, slug),
  })

  if (!room) {
    return res.status(404).json({ error: "Room not found" })
  }

  if (room.isDeleted) {
    return res.status(410).json({ error: "Room has been deleted" })
  }

  const messages = await db.query.messages.findMany({
    where: (messages, { eq }) => eq(messages.roomId, room.id),
    orderBy: (messages, { asc }) => asc(messages.id),
    limit: 50,
  })

  return res.json(messages)
}
