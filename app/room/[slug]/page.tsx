"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import axios from "axios"
import { WebSocketProvider, useWebSocket } from "@/hooks/WebSocketContext"
import { RoomHeader } from "@/components/room/RoomHeader"
import { MessageBubble, type Message } from "@/components/room/MessageBubble"
import { ChatInput } from "@/components/room/ChatInput"
import { JoinRoomModal } from "@/components/modals/JoinRoomModal"
import { AnimatePresence } from "motion/react"
import * as motion from "motion/react-client"
import { Loader2, MessageCircleOff, AlertTriangle } from "lucide-react"

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"

// ─── Inner chat (inside WebSocketProvider) ──────────────────────────────────
function RoomChat({ slug, username }: { slug: string; username: string }) {
  const { isConnected, clientId, lastMessage, sendMessage } = useWebSocket()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [roomError, setRoomError] = useState<string | null>(null)
  const [joined, setJoined] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const msgIdRef = useRef(0)

  // ── Load historical messages ──────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(
          `${BACKEND_URL}/api/v1/messages/message/${slug}`,
          { validateStatus: () => true, withCredentials: true }
        )
        if (res.status >= 400) {
          setRoomError("Room not found or has been deleted.")
          setLoading(false)
          return
        }
        const data = res.data
        const mapped: Message[] = (
          data as Array<{
            id: number
            message: string
            senderName: string | null
            userId: number | string | null
            isDeleted: boolean
            created_at: string
          }>
        ).map((m) => ({
          id: String(m.id),
          text: m.message,
          sender: m.senderName === username ? "me" : "them",
          senderName: m.senderName ?? `User ${m.userId ?? "?"}`,
          timestamp: new Date(m.created_at),
          deleted: m.isDeleted,
        }))
        setMessages(mapped)
      } catch {
        // Server might not be running — continue without history
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slug])

  // ── Join room over WS once connected ─────────────────────────────────────
  useEffect(() => {
    if (!isConnected || !username || joined) return
    sendMessage({ type: "join_room", slug, name: username })
    setJoined(true)
  }, [isConnected, slug, username, joined, sendMessage])

  // ── Handle incoming WS messages ───────────────────────────────────────────
  useEffect(() => {
    if (!lastMessage) return
    const { type, userId, message, slug: msgSlug } = lastMessage
    if (msgSlug && msgSlug !== slug) return

    if (type === "message" && message) {
      const isMe = userId === clientId
      if (isMe) return // already added optimistically
      const newMsg: Message = {
        id: `ws-${++msgIdRef.current}`,
        text: message,
        sender: "them",
        senderName: (lastMessage.senderName as string) ?? `User ${userId}`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, newMsg])
    } else if ((type === "user_joined" || type === "user_left") && message) {
      const newMsg: Message = {
        id: `ws-${++msgIdRef.current}`,
        text: message,
        sender: "system",
        senderName: "System",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, newMsg])
    }
  }, [lastMessage, clientId, slug])

  // ── Auto-scroll ───────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // ── Send message ──────────────────────────────────────────────────────────
  const handleSend = useCallback(
    (text: string) => {
      const newMsg: Message = {
        id: `me-${++msgIdRef.current}`,
        text,
        sender: "me",
        senderName: username,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, newMsg])
      sendMessage({ type: "message", slug, message: text })
    },
    [slug, username, sendMessage]
  )

  // ── Delete (soft-delete locally) ─────────────────────────────────────────
  const handleDelete = useCallback((id: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, deleted: true } : m))
    )
  }, [])

  // ── Error state ───────────────────────────────────────────────────────────
  if (roomError) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-destructive/25 bg-destructive/10 text-destructive">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <div>
          <p className="mb-1 font-semibold text-foreground">{roomError}</p>
          <p className="text-sm text-muted-foreground">
            The room may have been deleted.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Messages */}
      <div className="mx-auto w-full max-w-4xl flex-1 overflow-y-auto px-1 py-6 sm:px-4">
        {loading ? (
          <div className="flex h-40 items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Loading messages…</span>
          </div>
        ) : messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex h-40 flex-col items-center justify-center gap-3 text-center"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-muted">
              <MessageCircleOff className="h-7 w-7 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                No messages yet
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Be the first to say something!
              </p>
            </div>
          </motion.div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                onDelete={msg.sender === "me" ? handleDelete : undefined}
              />
            ))}
          </AnimatePresence>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="mx-auto w-full max-w-4xl">
        <ChatInput onSend={handleSend} disabled={!isConnected} />
      </div>
    </div>
  )
}

// ─── Inner layout (uses WS context for header) ───────────────────────────────
function RoomLayout({ slug, username }: { slug: string; username: string }) {
  const { isConnected, userCount } = useWebSocket()
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <RoomHeader slug={slug} isConnected={isConnected} userCount={userCount} />
      <RoomChat slug={slug} username={username} />
    </div>
  )
}

// ─── Page (provides WS context) ──────────────────────────────────────────────
export default function RoomPage() {
  const params = useParams()
  const slug =
    typeof params.slug === "string"
      ? params.slug
      : ((params.slug as string[])?.[0] ?? "")

  const [username, setUsername] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem(`user_${slug}`)
    }
    return null
  });

  const [showJoinModal, setShowJoinModal] = useState(() => {
    if (typeof window !== "undefined") {
      return !sessionStorage.getItem(`user_${slug}`)
    }
    return false // Default for SSR
  });

  // After the modal completes (user wrote their name and joined), update state
  const handleJoinClose = useCallback(() => {
    const stored = sessionStorage.getItem(`user_${slug}`)
    if (stored) {
      setUsername(stored)
      setShowJoinModal(false)
    } else {
      // User closed without joining — keep modal visible or let them leave
      setShowJoinModal(false)
    }
  }, [slug])

  // Show join modal for shared-link arrivals
  if (showJoinModal || username === null) {
    return (
      <JoinRoomModal
        open={showJoinModal || username === null}
        onClose={handleJoinClose}
        prefillSlug={slug}
      />
    )
  }

  return (
    <WebSocketProvider>
      <RoomLayout slug={slug} username={username} />
    </WebSocketProvider>
  )
}
