"use client"

import { useState } from "react"
import { Copy, Link2, Check, Wifi, WifiOff, MessageCircle } from "lucide-react"
import { AnimatePresence } from "motion/react"
import * as motion from "motion/react-client"

interface RoomHeaderProps {
  slug: string
  isConnected: boolean
  userCount: number
}

export function RoomHeader({ slug, isConnected, userCount }: RoomHeaderProps) {
  const [copiedId, setCopiedId] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  const handleCopyId = async () => {
    await navigator.clipboard.writeText(slug)
    setCopiedId(true)
    setTimeout(() => setCopiedId(false), 2000)
  }

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/room/${slug}`
    await navigator.clipboard.writeText(url)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  return (
    <header className="glass sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border px-4 py-3">
      {/* Left: Brand + Room Info */}
      <div className="flex min-w-0 items-center gap-3">
        <img src="/favicon.ico" alt="logo" className="h-6 w-6 sm:h-7 sm:w-7 lg:h-[30px] lg:w-[30px]" />
        <div className="flex flex-shrink-0 items-center gap-2">
          <span className="hidden text-sm font-bold text-foreground sm:block">
            Privora
          </span>
        </div>

        <div className="h-5 w-px flex-shrink-0 bg-border" />

        <div className="flex min-w-0 items-center gap-1.5">
          <span className="flex-shrink-0 text-xs font-medium text-muted-foreground">
            Room
          </span>
          <code className="max-w-[120px] truncate rounded-md border border-violet-500/20 bg-violet-500/10 px-2 py-0.5 font-mono text-xs text-violet-300 sm:max-w-[200px]">
            {slug}
          </code>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex flex-shrink-0 items-center gap-1.5">
        {/* Connection indicator */}
        <div
          className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium ${isConnected ? "text-emerald-400" : "text-muted-foreground"}`}
        >
          {isConnected ? (
            <Wifi className="h-3.5 w-3.5" />
          ) : (
            <WifiOff className="h-3.5 w-3.5" />
          )}
          <span className="hidden sm:block">
            {isConnected ? "Live" : "Offline"}
          </span>
        </div>

        <div className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-2 py-1 text-xs font-medium text-muted-foreground">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-500"></span>
          </span>
          <span>
            {userCount} user{userCount !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="h-4 w-px bg-border" />

        {/* Copy ID */}
        <button
          id="copy-room-id-btn"
          onClick={handleCopyId}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all duration-150 hover:bg-muted/50 hover:text-foreground"
          title="Copy Room ID"
        >
          <AnimatePresence mode="wait" initial={false}>
            {copiedId ? (
              <motion.span
                key="check"
                initial={{ scale: 0.7 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.7 }}
                className="text-emerald-400"
              >
                <Check className="h-3.5 w-3.5" />
              </motion.span>
            ) : (
              <motion.span
                key="copy"
                initial={{ scale: 0.7 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.7 }}
              >
                <Copy className="h-3.5 w-3.5" />
              </motion.span>
            )}
          </AnimatePresence>
          <span className="hidden sm:block">
            {copiedId ? "Copied!" : "Copy ID"}
          </span>
        </button>

        {/* Share Link */}
        <button
          id="share-link-btn"
          onClick={handleCopyLink}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all duration-150 hover:bg-muted/50 hover:text-foreground"
          title="Share Link"
        >
          <AnimatePresence mode="wait" initial={false}>
            {copiedLink ? (
              <motion.span
                key="check"
                initial={{ scale: 0.7 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.7 }}
                className="text-emerald-400"
              >
                <Check className="h-3.5 w-3.5" />
              </motion.span>
            ) : (
              <motion.span
                key="link"
                initial={{ scale: 0.7 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.7 }}
              >
                <Link2 className="h-3.5 w-3.5" />
              </motion.span>
            )}
          </AnimatePresence>
          <span className="hidden sm:block">
            {copiedLink ? "Copied!" : "Share Link"}
          </span>
        </button>
      </div>
    </header>
  )
}
