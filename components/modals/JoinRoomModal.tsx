"use client"

import { useState, useEffect, useRef } from "react"
import { AnimatePresence } from "motion/react"
import * as motion from "motion/react-client"
import { useRouter } from "next/navigation"
import { X, Hash, User, LogIn, Loader2 } from "lucide-react"
import axios from "axios"

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"

const avatarColors = [
  "from-violet-500 to-purple-600",
  "from-indigo-500 to-blue-600",
  "from-fuchsia-500 to-pink-600",
  "from-cyan-500 to-teal-600",
]
function getAvatarColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return avatarColors[Math.abs(hash) % avatarColors.length]
}

interface JoinRoomModalProps {
  open: boolean
  onClose: () => void
  /** When provided (shared-link flow), pre-fills and locks the Room ID field */
  prefillSlug?: string
}

export function JoinRoomModal({
  open,
  onClose,
  prefillSlug,
}: JoinRoomModalProps) {
  const [username, setUsername] = useState("")
  const [roomId, setRoomId] = useState(prefillSlug ?? "")
  const [prevSlug, setPrevSlug] = useState(prefillSlug);
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleClose = () => {
    setError("");
    setUsername("");
    onClose();
  }
  if(prefillSlug !== prevSlug) {
    setRoomId(prefillSlug || "");
    setPrevSlug(prefillSlug);
  }
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 80)
    }
  }, [open, prefillSlug])

  const handleJoin = async () => {
    const name = username.trim()
    const slug = roomId.trim()
    if (!name) {
      setError("Please enter your username.")
      return
    }
    if (!slug) {
      setError("Please enter a Room ID.")
      return
    }
    setLoading(true)
    setError("")
    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/v1/rooms/joinRoom`,
        { slug },
        { validateStatus: () => true }
      )
      const data = res.data
      if (res.status >= 400) {
        setError(data.error ?? "Could not join room.")
        setLoading(false)
        return
      }
      sessionStorage.setItem(`user_${slug}`, name)
      handleClose();
      // If we were pre-filled with a slug (shared-link), we're already on the room page
      if (!prefillSlug) {
        router.push(`/room/${slug}`)
      }
    } catch {
      setError("Network error. Is the server running?")
      setLoading(false)
    }
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleJoin()
    if (e.key === "Escape") onClose()
  }

  const color = username.trim()
    ? getAvatarColor(username.trim())
    : "from-muted to-muted"

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
            className="glass-card relative w-full max-w-md rounded-2xl p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header */}
            <div className="mb-6">
              <div className="mb-1 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-indigo-500/25 bg-indigo-500/15 text-indigo-400">
                  <LogIn className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Join Room</h2>
              </div>
              <p className="ml-12 text-sm leading-relaxed text-muted-foreground">
                Enter the room ID shared with you to join the conversation.
              </p>
            </div>

            <div className="mb-5 space-y-4">
              {/* Username */}
              <div className="space-y-2">
                <label
                  htmlFor="join-username"
                  className="text-xs font-medium tracking-wider text-muted-foreground uppercase"
                >
                  Your Name
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="join-username"
                    ref={inputRef}
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value)
                      setError("")
                    }}
                    onKeyDown={handleKey}
                    placeholder="Enter your username"
                    maxLength={32}
                    className="w-full rounded-xl border border-border bg-input py-3 pr-4 pl-9 text-sm text-foreground transition-all duration-150 outline-none placeholder:text-muted-foreground focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20"
                  />
                </div>
              </div>

              {/* Room ID */}
              <div className="space-y-2">
                <label
                  htmlFor="join-roomid"
                  className="text-xs font-medium tracking-wider text-muted-foreground uppercase"
                >
                  Room ID
                </label>
                <div className="relative">
                  <Hash className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="join-roomid"
                    value={roomId}
                    onChange={(e) => {
                      if (!prefillSlug) {
                        setRoomId(e.target.value)
                        setError("")
                      }
                    }}
                    onKeyDown={handleKey}
                    placeholder="Paste room ID here"
                    readOnly={!!prefillSlug}
                    className={`w-full rounded-xl border border-border bg-input py-3 pr-4 pl-9 font-mono text-sm text-foreground transition-all duration-150 outline-none placeholder:text-muted-foreground focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 ${prefillSlug ? "cursor-not-allowed opacity-70 select-all" : ""}`}
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
            <div className="mb-5 flex items-center gap-3 rounded-xl border border-border bg-secondary/50 px-4 py-3">
              <div
                className={`h-9 w-9 rounded-full bg-gradient-to-br ${color} flex flex-shrink-0 items-center justify-center text-sm font-bold text-white`}
              >
                {username.trim() ? username.trim()[0].toUpperCase() : "?"}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  You&apos;ll join as
                </p>
                <p className="max-w-[220px] truncate text-sm font-semibold text-foreground">
                  {username.trim() || "your username"}
                </p>
              </div>
            </div>

            {/* Action */}
            <button
              id="confirm-join-btn"
              onClick={handleJoin}
              disabled={loading || !username.trim() || !roomId.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold tracking-wide text-white transition-all duration-150 hover:bg-indigo-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Joining…
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Join Room
                </>
              )}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
