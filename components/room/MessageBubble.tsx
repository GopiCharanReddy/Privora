"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";

export interface Message {
    id: string;
    text: string;
    sender: "me" | "them";
    senderName: string;
    timestamp: Date;
    deleted?: boolean;
}

const avatarColors: Record<string, string> = {};
const palette = [
    "from-violet-500 to-purple-600",
    "from-indigo-500 to-blue-600",
    "from-fuchsia-500 to-pink-600",
    "from-cyan-500 to-teal-600",
    "from-emerald-500 to-green-600",
    "from-amber-500 to-orange-600",
];
function getColorFor(name: string) {
    if (!avatarColors[name]) {
        let hash = 0;
        for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
        avatarColors[name] = palette[Math.abs(hash) % palette.length];
    }
    return avatarColors[name];
}

function formatTime(date: Date) {
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
}

interface MessageBubbleProps {
    message: Message;
    onDelete?: (id: string) => void;
}

export function MessageBubble({ message, onDelete }: MessageBubbleProps) {
    const [hovered, setHovered] = useState(false);
    const isMe = message.sender === "me";
    const color = getColorFor(message.senderName);

    if (message.deleted) {
        return (
            <div className={`flex ${isMe ? "justify-end" : "justify-start"} px-2 mb-1`}>
                <span className="text-xs text-muted-foreground italic px-3 py-1.5">
                    This message was deleted
                </span>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: isMe ? 12 : -12, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className={`flex items-end gap-2 px-2 mb-3 ${isMe ? "flex-row-reverse" : "flex-row"}`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Avatar */}
            {!isMe && (
                <div
                    className={`w-7 h-7 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mb-0.5`}
                    title={message.senderName}
                >
                    {message.senderName[0]?.toUpperCase()}
                </div>
            )}

            <div className={`flex flex-col gap-0.5 max-w-[72%] sm:max-w-[60%] ${isMe ? "items-end" : "items-start"}`}>
                {/* Sender label */}
                <div className={`flex items-center gap-2 px-1 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                    <span className="text-xs font-semibold text-muted-foreground">
                        {isMe ? "You" : message.senderName}
                    </span>
                    <span className="text-[10px] text-muted-foreground/60 font-mono">
                        {formatTime(message.timestamp)}
                    </span>
                </div>

                {/* Bubble */}
                <div className="relative group flex items-end gap-1.5">
                    <div
                        className={`
              relative px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words
              ${isMe
                                ? "bg-violet-600 text-white rounded-br-sm"
                                : "bg-secondary text-foreground rounded-bl-sm border border-border"
                            }
            `}
                    >
                        {message.text}
                    </div>

                    {/* Delete button (only for own messages) */}
                    {isMe && onDelete && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.7 }}
                            animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.7 }}
                            transition={{ duration: 0.12 }}
                            onClick={() => onDelete(message.id)}
                            className="flex-shrink-0 w-6 h-6 rounded-full bg-muted border border-border flex items-center justify-center text-muted-foreground hover:text-destructive hover:border-destructive/50 transition-colors duration-150"
                            title="Delete message"
                        >
                            <Trash2 className="w-3 h-3" />
                        </motion.button>
                    )}
                </div>
            </div>

            {/* Own avatar */}
            {isMe && (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mb-0.5">
                    Y
                </div>
            )}
        </motion.div>
    );
}
