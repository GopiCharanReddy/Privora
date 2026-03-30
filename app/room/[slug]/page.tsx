"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { WebSocketProvider, useWebSocket } from "@/hooks/WebSocketContext";
import { RoomHeader } from "@/components/room/RoomHeader";
import { MessageBubble, type Message } from "@/components/room/MessageBubble";
import { ChatInput } from "@/components/room/ChatInput";
import { JoinRoomModal } from "@/components/modals/JoinRoomModal";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, MessageCircleOff, AlertTriangle } from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

// ─── Inner chat (inside WebSocketProvider) ──────────────────────────────────
function RoomChat({ slug, username }: { slug: string; username: string }) {
    const { isConnected, clientId, lastMessage, sendMessage } = useWebSocket();
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [roomError, setRoomError] = useState<string | null>(null);
    const [joined, setJoined] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const msgIdRef = useRef(0);

    // ── Load historical messages ──────────────────────────────────────────────
    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch(`${BACKEND_URL}/api/v1/messages/message/${slug}`);
                if (!res.ok) {
                    setRoomError("Room not found or has been deleted.");
                    setLoading(false);
                    return;
                }
                const data = await res.json();
                const mapped: Message[] = (
                    data as Array<{
                        id: number;
                        message: string;
                        senderName: string | null;
                        userId: number | string | null;
                        isDeleted: boolean;
                        created_at: string;
                    }>
                ).map((m) => ({
                    id: String(m.id),
                    text: m.message,
                    sender: "them" as const,
                    senderName: m.senderName ?? `User ${m.userId ?? "?"}`,
                    timestamp: new Date(m.created_at),
                    deleted: m.isDeleted,
                }));
                setMessages(mapped);
            } catch {
                // Server might not be running — continue without history
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [slug]);

    // ── Join room over WS once connected ─────────────────────────────────────
    useEffect(() => {
        if (!isConnected || !username || joined) return;
        sendMessage({ type: "join_room", slug, name: username });
        setJoined(true);
    }, [isConnected, slug, username, joined, sendMessage]);

    // ── Handle incoming WS messages ───────────────────────────────────────────
    useEffect(() => {
        if (!lastMessage) return;
        const { type, userId, message, slug: msgSlug } = lastMessage;
        if (msgSlug && msgSlug !== slug) return;

        if (type === "message" && message) {
            const isMe = userId === clientId;
            if (isMe) return; // already added optimistically
            const newMsg: Message = {
                id: `ws-${++msgIdRef.current}`,
                text: message,
                sender: "them",
                senderName: (lastMessage.senderName as string) ?? `User ${userId}`,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, newMsg]);
        }
    }, [lastMessage, clientId, slug]);

    // ── Auto-scroll ───────────────────────────────────────────────────────────
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // ── Send message ──────────────────────────────────────────────────────────
    const handleSend = useCallback(
        (text: string) => {
            const newMsg: Message = {
                id: `me-${++msgIdRef.current}`,
                text,
                sender: "me",
                senderName: username,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, newMsg]);
            sendMessage({ type: "message", slug, message: text });
        },
        [slug, username, sendMessage]
    );

    // ── Delete (soft-delete locally) ─────────────────────────────────────────
    const handleDelete = useCallback((id: string) => {
        setMessages((prev) =>
            prev.map((m) => (m.id === id ? { ...m, deleted: true } : m))
        );
    }, []);

    // ── Error state ───────────────────────────────────────────────────────────
    if (roomError) {
        return (
            <div className="flex flex-col items-center justify-center flex-1 gap-4 text-center p-8">
                <div className="w-14 h-14 rounded-2xl bg-destructive/10 border border-destructive/25 flex items-center justify-center text-destructive">
                    <AlertTriangle className="w-7 h-7" />
                </div>
                <div>
                    <p className="font-semibold text-foreground mb-1">{roomError}</p>
                    <p className="text-sm text-muted-foreground">The room may have been deleted.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col flex-1 min-h-0">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto py-6 px-1 sm:px-4 max-w-4xl w-full mx-auto">
                {loading ? (
                    <div className="flex items-center justify-center h-40 gap-3 text-muted-foreground">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="text-sm">Loading messages…</span>
                    </div>
                ) : messages.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center h-40 gap-3 text-center"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-muted border border-border flex items-center justify-center">
                            <MessageCircleOff className="w-7 h-7 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="font-medium text-foreground text-sm">No messages yet</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Be the first to say something!</p>
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
            <div className="max-w-4xl w-full mx-auto">
                <ChatInput onSend={handleSend} disabled={!isConnected} />
            </div>
        </div>
    );
}

// ─── Inner layout (uses WS context for header) ───────────────────────────────
function RoomLayout({ slug, username }: { slug: string; username: string }) {
    const { isConnected } = useWebSocket();
    return (
        <div className="flex flex-col h-screen bg-background overflow-hidden">
            <RoomHeader slug={slug} isConnected={isConnected} />
            <RoomChat slug={slug} username={username} />
        </div>
    );
}

// ─── Page (provides WS context) ──────────────────────────────────────────────
export default function RoomPage() {
    const params = useParams();
    const slug =
        typeof params.slug === "string"
            ? params.slug
            : (params.slug as string[])?.[0] ?? "";

    const [username, setUsername] = useState<string | null>(null);
    const [showJoinModal, setShowJoinModal] = useState(false);

    useEffect(() => {
        if (!slug) return;
        const stored = sessionStorage.getItem(`user_${slug}`);
        if (stored) {
            setUsername(stored);
        } else {
            // No stored name — open the join modal with slug pre-filled
            setShowJoinModal(true);
        }
    }, [slug]);

    // After the modal completes (user wrote their name and joined), update state
    const handleJoinClose = useCallback(() => {
        const stored = sessionStorage.getItem(`user_${slug}`);
        if (stored) {
            setUsername(stored);
            setShowJoinModal(false);
        } else {
            // User closed without joining — keep modal visible or let them leave
            setShowJoinModal(false);
        }
    }, [slug]);

    // Show join modal for shared-link arrivals
    if (showJoinModal || username === null) {
        return (
            <JoinRoomModal
                open={showJoinModal || username === null}
                onClose={handleJoinClose}
                prefillSlug={slug}
            />
        );
    }

    return (
        <WebSocketProvider>
            <RoomLayout slug={slug} username={username} />
        </WebSocketProvider>
    );
}
