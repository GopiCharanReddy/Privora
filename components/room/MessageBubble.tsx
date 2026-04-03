"use client"

import { useState } from "react"
import * as motion from "motion/react-client"
import { Trash2 } from "lucide-react"

export interface Message {
  id: string
  text: string
  sender: "me" | "them" | "system"
  senderName: string
  timestamp: Date
  deleted?: boolean
}

const avatarColors: Record<string, string> = {}
const palette = [
  "from-violet-500 to-purple-600",
  "from-indigo-500 to-blue-600",
  "from-fuchsia-500 to-pink-600",
  "from-cyan-500 to-teal-600",
  "from-emerald-500 to-green-600",
  "from-amber-500 to-orange-600",
]
function getColorFor(name: string) {
  if (!avatarColors[name]) {
    let hash = 0
    for (let i = 0; i < name.length; i++)
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    avatarColors[name] = palette[Math.abs(hash) % palette.length]
  }
  return avatarColors[name]
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}

interface MessageBubbleProps {
  message: Message
  onDelete?: (id: string) => void
}

export function MessageBubble({ message, onDelete }: MessageBubbleProps) {
  const [hovered, setHovered] = useState(false)
  const isMe = message.sender === "me"
  const color = getColorFor(message.senderName)

  if (message.deleted) {
    return (
      <div
        className={`flex ${isMe ? "justify-end" : "justify-start"} mb-1 px-2`}
      >
        <span className="px-3 py-1.5 text-xs text-muted-foreground italic">
          This message was deleted
        </span>
      </div>
    )
  }

  if (message.sender === "system") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="mb-3 flex items-center justify-center px-2"
      >
        <div className="rounded-full border border-border/40 bg-muted/50 px-3 py-1 text-[11px] font-medium text-muted-foreground">
          {message.text}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: isMe ? 12 : -12, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className={`mb-3 flex items-end gap-2 px-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Avatar */}
      {!isMe && (
        <div
          className={`h-7 w-7 rounded-full bg-gradient-to-br ${color} mb-0.5 flex flex-shrink-0 items-center justify-center text-xs font-bold text-white`}
          title={message.senderName}
        >
          {message.senderName[0]?.toUpperCase()}
        </div>
      )}

      <div
        className={`flex max-w-[72%] flex-col gap-0.5 sm:max-w-[60%] ${isMe ? "items-end" : "items-start"}`}
      >
        {/* Sender label */}
        <div
          className={`flex items-center gap-2 px-1 ${isMe ? "flex-row-reverse" : "flex-row"}`}
        >
          <span className="text-xs font-semibold text-muted-foreground">
            {isMe ? "You" : message.senderName}
          </span>
          <span className="font-mono text-[10px] text-muted-foreground/60">
            {formatTime(message.timestamp)}
          </span>
        </div>

        {/* Bubble */}
        <div className="group relative flex items-end gap-1.5">
          <div
            className={`relative rounded-2xl px-4 py-2.5 text-sm leading-relaxed break-words ${
              isMe
                ? "rounded-br-sm bg-violet-600 text-white"
                : "rounded-bl-sm border border-border bg-secondary text-foreground"
            } `}
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
              className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground transition-colors duration-150 hover:border-destructive/50 hover:text-destructive"
              title="Delete message"
            >
              <Trash2 className="h-3 w-3" />
            </motion.button>
          )}
        </div>
      </div>

      {/* Own avatar */}
      {isMe && (
        <div className="mb-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-xs font-bold text-white">
          Y
        </div>
      )}
    </motion.div>
  )
}
