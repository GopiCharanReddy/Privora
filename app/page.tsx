"use client"

import { useState } from "react"
import { BackgroundLines } from "@/components/ui/background-lines"
import { CreateRoomModal } from "@/components/modals/CreateRoomModal"
import { JoinRoomModal } from "@/components/modals/JoinRoomModal"
import * as motion from "motion/react-client"
import { Lock, Zap, Users, Plus, LogIn, Trash2 } from "lucide-react"

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
}

const features = [
  {
    icon: <Trash2 className="h-5 w-5" />,
    title: "Auto-Destruct",
    description: "Rooms vanish the moment everyone leaves. Zero footprint.",
  },
  {
    icon: <Lock className="h-5 w-5" />,
    title: "No Accounts",
    description: "Jump in with just a username. No sign-ups, no passwords.",
  },
  {
    icon: <Zap className="h-5 w-5" />,
    title: "Real-Time",
    description: "WebSocket-powered instant delivery with live updates.",
  },
  {
    icon: <Users className="h-5 w-5" />,
    title: "Private Rooms",
    description: "Share a slug to invite. No one else gets in.",
  },
]

export default function HomePage() {
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)

  return (
    <>
      <BackgroundLines className="flex min-h-screen flex-col items-center justify-center bg-background">
        {/* Radial glow overlay */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-[600px] w-[600px] rounded-full bg-violet-600/5 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center gap-8 px-4 text-center">
          {/* Badge */}
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-medium tracking-widest text-violet-300 uppercase">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-400" />
              Secure · Private · Anonymous
            </span>
          </motion.div>

          {/* Hero title */}
          <motion.div
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-3"
          >
            <h1 className="text-6xl leading-none font-extrabold tracking-tight sm:text-7xl lg:text-8xl">
              <span className="gradient-text">Privora</span>
            </h1>
            <p className="text-lg font-light tracking-wide text-muted-foreground sm:text-xl">
              Private rooms that disappear when you&apos;re done.{" "}
              <br className="hidden sm:block" />
              No trace. No history. Just conversation.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="flex w-full max-w-sm flex-col gap-3 sm:flex-row"
          >
            <button
              id="create-room-btn"
              onClick={() => setShowCreate(true)}
              className="group glow-violet-sm hover:glow-violet relative flex flex-1 items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-violet-600 px-8 py-3.5 text-sm font-semibold tracking-wide text-white transition-all duration-200 hover:bg-violet-500 active:scale-[0.98]"
            >
              <Plus className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" />
              Create Room
            </button>
            <button
              id="join-room-btn"
              onClick={() => setShowJoin(true)}
              className="group flex flex-1 items-center justify-center gap-2.5 rounded-xl border border-border bg-muted/30 px-8 py-3.5 text-sm font-semibold tracking-wide text-foreground transition-all duration-200 hover:border-violet-500/50 hover:bg-muted/60 active:scale-[0.98]"
            >
              <LogIn className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              Join Room
            </button>
          </motion.div>

          {/* Divider */}
          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="flex w-full max-w-sm items-center gap-4"
          >
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs tracking-widest text-muted-foreground uppercase">
              Features
            </span>
            <div className="h-px flex-1 bg-border" />
          </motion.div>

          {/* Feature cards */}
          <motion.div
            custom={4}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4"
          >
            {features.map((f, i) => (
              <div
                key={i}
                className="feature-card glass-card flex flex-col gap-2 rounded-xl p-4 text-left"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-violet-500/20 bg-violet-500/15 text-violet-400">
                  {f.icon}
                </div>
                <p className="text-xs font-semibold text-foreground">
                  {f.title}
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {f.description}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </BackgroundLines>

      {/* Modals */}
      <CreateRoomModal open={showCreate} onClose={() => setShowCreate(false)} />
      <JoinRoomModal open={showJoin} onClose={() => setShowJoin(false)} />
    </>
  )
}
