"use client"

import { useState, useEffect, useRef } from "react"
import { AnimatePresence } from "motion/react"
import * as motion from "motion/react-client"
import { useRouter } from "next/navigation"
import { X, Plus, User, Loader2 } from "lucide-react"
import axios from "axios"

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"
console.log(BACKEND_URL)

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

interface CreateRoomModalProps {
  open: boolean
  onClose: () => void
}

export function CreateRoomModal({ open, onClose }: CreateRoomModalProps) {
  const [username, setUsername] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleClose = () => {
    setError("");
    setUsername("");
    onClose();
  }
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 80)
    }
  }, [open])

  const handleCreate = async () => {
    const name = username.trim()
    if (!name) {
      setError("Please enter a username to continue.")
      return
    }
    setLoading(true)
    setError("")
    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/v1/rooms/createRoom`,
        { user: name },
        {
          validateStatus: () => true,
          withCredentials: true
        }
      )
      const data = res.data
      if (res.status >= 400) {
        setError(data.error ?? "Could not create room.")
        setLoading(false)
        return
      }
      // Store username in sessionStorage keyed by slug
      sessionStorage.setItem(`user_${data.slug}`, name)
      handleClose();
      router.push(`/room/${data.slug}`)
    } catch {
      setError("Network error. Is the server running?")
      setLoading(false)
    }
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleCreate()
    if (e.key === "Escape") onClose()
  }

  const color = username.trim()
    ? getAvatarColor(username.trim())
    : "from-muted to-muted"
  const displayName = username.trim() || "your username"

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
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-500/25 bg-violet-500/15 text-violet-400">
                  <Plus className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold text-foreground">
                  Create Room
                </h2>
              </div>
              <p className="ml-12 text-sm leading-relaxed text-muted-foreground">
                Start a new private room. Share the ID to invite others.
              </p>
            </div>

            {/* Username field */}
            <div className="mb-4 space-y-2">
              <label
                htmlFor="create-username"
                className="text-xs font-medium tracking-wider text-muted-foreground uppercase"
              >
                Your Name
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="create-username"
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
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-xs text-destructive"
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
                  {displayName}
                </p>
              </div>
            </div>

            {/* Action */}
            <button
              id="confirm-create-btn"
              onClick={handleCreate}
              disabled={loading || !username.trim()}
              className="glow-violet-sm flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-3.5 text-sm font-semibold tracking-wide text-white transition-all duration-150 hover:bg-violet-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating…
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Create New Room
                </>
              )}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
