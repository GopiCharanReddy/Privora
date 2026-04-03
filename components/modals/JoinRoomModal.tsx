"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence } from "motion/react";
import * as motion from "motion/react-client";
import { useRouter } from "next/navigation";
import { X, Hash, User, LogIn, Loader2 } from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

const avatarColors = [
    "from-violet-500 to-purple-600",
    "from-indigo-500 to-blue-600",
    "from-fuchsia-500 to-pink-600",
    "from-cyan-500 to-teal-600",
];
function getAvatarColor(name: string) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return avatarColors[Math.abs(hash) % avatarColors.length];
}

interface JoinRoomModalProps {
    open: boolean;
    onClose: () => void;
    /** When provided (shared-link flow), pre-fills and locks the Room ID field */
    prefillSlug?: string;
}

export function JoinRoomModal({ open, onClose, prefillSlug }: JoinRoomModalProps) {
    const [username, setUsername] = useState("");
    const [roomId, setRoomId] = useState(prefillSlug ?? "");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    useEffect(() => {
        if (open) {
            setError("");
            if (prefillSlug) setRoomId(prefillSlug);
            setTimeout(() => inputRef.current?.focus(), 80);
        }
    }, [open, prefillSlug]);

    const handleJoin = async () => {
        const name = username.trim();
        const slug = roomId.trim();
        if (!name) { setError("Please enter your username."); return; }
        if (!slug) { setError("Please enter a Room ID."); return; }
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${BACKEND_URL}/api/v1/rooms/joinRoom`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ slug }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error ?? "Could not join room.");
                setLoading(false);
                return;
            }
            sessionStorage.setItem(`user_${slug}`, name);
            onClose();
            // If we were pre-filled with a slug (shared-link), we're already on the room page
            if (!prefillSlug) {
                router.push(`/room/${slug}`);
            }
        } catch {
            setError("Network error. Is the server running?");
            setLoading(false);
        }
    };

    const handleKey = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleJoin();
        if (e.key === "Escape") onClose();
    };

    const color = username.trim() ? getAvatarColor(username.trim()) : "from-muted to-muted";

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    key="join-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

                    <motion.div
                        key="join-modal"
                        initial={{ opacity: 0, scale: 0.93, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.93, y: 16 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        className="relative glass-card rounded-2xl w-full max-w-md p-6 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted/50"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        {/* Header */}
                        <div className="mb-6">
                            <div className="flex items-center gap-3 mb-1">
                                <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-400">
                                    <LogIn className="w-5 h-5" />
                                </div>
                                <h2 className="text-xl font-bold text-foreground">Join Room</h2>
                            </div>
                            <p className="text-sm text-muted-foreground ml-12 leading-relaxed">
                                Enter the room ID shared with you to join the conversation.
                            </p>
                        </div>

                        <div className="space-y-4 mb-5">
                            {/* Username */}
                            <div className="space-y-2">
                                <label htmlFor="join-username" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Your Name
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                                    <input
                                        id="join-username"
                                        ref={inputRef}
                                        value={username}
                                        onChange={(e) => { setUsername(e.target.value); setError(""); }}
                                        onKeyDown={handleKey}
                                        placeholder="Enter your username"
                                        maxLength={32}
                                        className="w-full pl-9 pr-4 py-3 rounded-xl bg-input border border-border focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 outline-none text-sm text-foreground placeholder:text-muted-foreground transition-all duration-150"
                                    />
                                </div>
                            </div>

                            {/* Room ID */}
                            <div className="space-y-2">
                                <label htmlFor="join-roomid" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Room ID
                                </label>
                                <div className="relative">
                                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                                    <input
                                        id="join-roomid"
                                        value={roomId}
                                        onChange={(e) => { if (!prefillSlug) { setRoomId(e.target.value); setError(""); } }}
                                        onKeyDown={handleKey}
                                        placeholder="Paste room ID here"
                                        readOnly={!!prefillSlug}
                                        className={`w-full pl-9 pr-4 py-3 rounded-xl bg-input border border-border focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm text-foreground placeholder:text-muted-foreground font-mono transition-all duration-150 ${prefillSlug ? "opacity-70 cursor-not-allowed select-all" : ""}`}
                                    />
                                </div>
                            </div>

                            {error && (
                                <motion.p
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-xs text-destructive"
                                >
                                    {error}
                                </motion.p>
                            )}
                        </div>

                        {/* Preview */}
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary/50 border border-border mb-5">
                            <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                                {username.trim() ? username.trim()[0].toUpperCase() : "?"}
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">You&apos;ll join as</p>
                                <p className="text-sm font-semibold text-foreground truncate max-w-[220px]">
                                    {username.trim() || "your username"}
                                </p>
                            </div>
                        </div>

                        {/* Action */}
                        <button
                            id="confirm-join-btn"
                            onClick={handleJoin}
                            disabled={loading || !username.trim() || !roomId.trim()}
                            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm tracking-wide bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-all duration-150 active:scale-[0.98]"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Joining…
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-4 h-4" />
                                    Join Room
                                </>
                            )}
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
