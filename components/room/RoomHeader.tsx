"use client";

import { useState } from "react";
import { Copy, Link2, Check, Wifi, WifiOff, MessageCircle } from "lucide-react";
import { AnimatePresence } from "motion/react";
import * as motion from "motion/react-client";

interface RoomHeaderProps {
    slug: string;
    isConnected: boolean;
    userCount: number;
}

export function RoomHeader({ slug, isConnected, userCount }: RoomHeaderProps) {
    const [copiedId, setCopiedId] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);

    const handleCopyId = async () => {
        await navigator.clipboard.writeText(slug);
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2000);
    };

    const handleCopyLink = async () => {
        const url = `${window.location.origin}/room/${slug}`;
        await navigator.clipboard.writeText(url);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
    };

    return (
        <header className="glass border-b border-border px-4 py-3 flex items-center justify-between gap-3 sticky top-0 z-20">
            {/* Left: Brand + Room Info */}
            <div className="flex items-center gap-3 min-w-0">
                <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-7 h-7 rounded-lg bg-violet-500/15 border border-violet-500/25 flex items-center justify-center">
                        <MessageCircle className="w-4 h-4 text-violet-400" />
                    </div>
                    <span className="text-sm font-bold text-foreground hidden sm:block">Privora</span>
                </div>

                <div className="w-px h-5 bg-border flex-shrink-0" />

                <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-xs text-muted-foreground font-medium flex-shrink-0">Room</span>
                    <code className="text-xs font-mono text-violet-300 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-md truncate max-w-[120px] sm:max-w-[200px]">
                        {slug}
                    </code>
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
                {/* Connection indicator */}
                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium ${isConnected ? "text-emerald-400" : "text-muted-foreground"}`}>
                    {isConnected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
                    <span className="hidden sm:block">{isConnected ? "Live" : "Offline"}</span>
                </div>

                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium text-muted-foreground bg-muted/40 border border-border">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
                    </span>
                    <span>{userCount} user{userCount !== 1 ? 's' : ''}</span>
                </div>

                <div className="w-px h-4 bg-border" />

                {/* Copy ID */}
                <button
                    id="copy-room-id-btn"
                    onClick={handleCopyId}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-150"
                    title="Copy Room ID"
                >
                    <AnimatePresence mode="wait" initial={false}>
                        {copiedId ? (
                            <motion.span key="check" initial={{ scale: 0.7 }} animate={{ scale: 1 }} exit={{ scale: 0.7 }} className="text-emerald-400">
                                <Check className="w-3.5 h-3.5" />
                            </motion.span>
                        ) : (
                            <motion.span key="copy" initial={{ scale: 0.7 }} animate={{ scale: 1 }} exit={{ scale: 0.7 }}>
                                <Copy className="w-3.5 h-3.5" />
                            </motion.span>
                        )}
                    </AnimatePresence>
                    <span className="hidden sm:block">{copiedId ? "Copied!" : "Copy ID"}</span>
                </button>

                {/* Share Link */}
                <button
                    id="share-link-btn"
                    onClick={handleCopyLink}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-150"
                    title="Share Link"
                >
                    <AnimatePresence mode="wait" initial={false}>
                        {copiedLink ? (
                            <motion.span key="check" initial={{ scale: 0.7 }} animate={{ scale: 1 }} exit={{ scale: 0.7 }} className="text-emerald-400">
                                <Check className="w-3.5 h-3.5" />
                            </motion.span>
                        ) : (
                            <motion.span key="link" initial={{ scale: 0.7 }} animate={{ scale: 1 }} exit={{ scale: 0.7 }}>
                                <Link2 className="w-3.5 h-3.5" />
                            </motion.span>
                        )}
                    </AnimatePresence>
                    <span className="hidden sm:block">{copiedLink ? "Copied!" : "Share Link"}</span>
                </button>
            </div>
        </header>
    );
}
