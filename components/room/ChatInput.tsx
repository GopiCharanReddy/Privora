"use client"

import { useRef, useState } from "react"
import { Send } from "lucide-react"

interface ChatInputProps {
  onSend: (text: string) => void
  disabled?: boolean
  onTyping?: () => void
}

export function ChatInput({ onSend, disabled, onTyping }: ChatInputProps) {
  const [value, setValue] = useState("")
  const [lastTypingEmit, setLastTypingEmit] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSend = () => {
    const text = value.trim()
    if (!text || disabled) return
    onSend(text)
    setValue("")
    inputRef.current?.focus()
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
    if (onTyping && !disabled && e.target.value.length > 0) {
      const now = Date.now()
      if (now - lastTypingEmit > 2000) {
        onTyping()
        setLastTypingEmit(now)
      }
    }
  }

  return (
    <div className="glass border-t border-border px-4 py-4">
      <div className="mx-auto flex max-w-4xl items-center gap-3">
        <div className="relative flex-1">
          <input
            id="message-input"
            ref={inputRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKey}
            placeholder="Type a message…"
            disabled={disabled}
            maxLength={500}
            autoComplete="off"
            className="w-full rounded-2xl border border-border bg-input px-5 py-3.5 pr-12 text-sm text-foreground transition-all duration-150 outline-none placeholder:text-muted-foreground/60 focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/15 disabled:opacity-50"
          />
          {/* Char count hint */}
          {value.length > 400 && (
            <span className="absolute top-1/2 right-4 -translate-y-1/2 font-mono text-[10px] text-muted-foreground">
              {500 - value.length}
            </span>
          )}
        </div>

        <button
          id="send-message-btn"
          onClick={handleSend}
          disabled={!value.trim() || disabled}
          className="glow-violet-sm flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-violet-600 text-white transition-all duration-150 hover:bg-violet-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
