"use client";

import { useRef, useState } from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
    onSend: (text: string) => void;
    disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
    const [value, setValue] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSend = () => {
        const text = value.trim();
        if (!text || disabled) return;
        onSend(text);
        setValue("");
        inputRef.current?.focus();
    };

    const handleKey = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="glass border-t border-border px-4 py-4">
            <div className="flex items-center gap-3 max-w-4xl mx-auto">
                <div className="flex-1 relative">
                    <input
                        id="message-input"
                        ref={inputRef}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onKeyDown={handleKey}
                        placeholder="Type a message…"
                        disabled={disabled}
                        maxLength={500}
                        autoComplete="off"
                        className="w-full px-5 py-3.5 rounded-2xl bg-input border border-border focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/15 outline-none text-sm text-foreground placeholder:text-muted-foreground/60 transition-all duration-150 disabled:opacity-50 pr-12"
                    />
                    {/* Char count hint */}
                    {value.length > 400 && (
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-mono">
                            {500 - value.length}
                        </span>
                    )}
                </div>

                <button
                    id="send-message-btn"
                    onClick={handleSend}
                    disabled={!value.trim() || disabled}
                    className="w-11 h-11 rounded-2xl flex items-center justify-center bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-all duration-150 active:scale-95 flex-shrink-0 glow-violet-sm"
                >
                    <Send className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
