"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { X, Plus, User, Loader2 } from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
console.log(BACKEND_URL);

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

interface CreateRoomModalProps {
    open: boolean;
    onClose: () => void;
}

export function CreateRoomModal({ open, onClose }: CreateRoomModalProps) {
    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    useEffect(() => {
        if (open) {
            setError("");
            setTimeout(() => inputRef.current?.focus(), 80);
        }
    }, [open]);

    const handleCreate = async () => {
        const name = username.trim();
        if (!name) {
            setError("Please enter a username to continue.");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${BACKEND_URL}/api/v1/rooms/createRoom`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user: name }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error ?? "Could not create room.");
                setLoading(false);
                return;
            }
            // Store username in sessionStorage keyed by slug
            sessionStorage.setItem(`user_${data.slug}`, name);
            onClose();
            router.push(`/room/${data.slug}`);
        } catch {
            setError("Network error. Is the server running?");
            setLoading(false);
        }
    };

    const handleKey = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleCreate();
        if (e.key === "Escape") onClose();
    };

    const color = username.trim() ? getAvatarColor(username.trim()) : "from-muted to-muted";
    const displayName = username.trim() || "your username";

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    key="create-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

                    {/* Modal */}
                    <motion.div
                        key="create-modal"
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
                                <div className="w-9 h-9 rounded-xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center text-violet-400">
                                    <Plus className="w-5 h-5" />
                                </div>
                                <h2 className="text-xl font-bold text-foreground">Create Room</h2>
                            </div>
                            <p className="text-sm text-muted-foreground ml-12 leading-relaxed">
                                Start a new private room. Share the ID to invite others.
                            </p>
                        </div>

                        {/* Username field */}
                        <div className="space-y-2 mb-4">
                            <label htmlFor="create-username" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Your Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                                <input
                                    id="create-username"
                                    ref={inputRef}
                                    value={username}
                                    onChange={(e) => { setUsername(e.target.value); setError(""); }}
                                    onKeyDown={handleKey}
                                    placeholder="Enter your username"
                                    maxLength={32}
                                    className="w-full pl-9 pr-4 py-3 rounded-xl bg-input border border-border focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 outline-none text-sm text-foreground placeholder:text-muted-foreground transition-all duration-150"
                                />
                            </div>
                            {error && (
                                <motion.p
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-xs text-destructive mt-1"
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
                                <p className="text-sm font-semibold text-foreground truncate max-w-[220px]">{displayName}</p>
                            </div>
                        </div>

                        {/* Action */}
                        <button
                            id="confirm-create-btn"
                            onClick={handleCreate}
                            disabled={loading || !username.trim()}
                            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm tracking-wide bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-all duration-150 active:scale-[0.98] glow-violet-sm"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Creating…
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4" />
                                    Create New Room
                                </>
                            )}
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
