"use client";

import { useState } from "react";
import { BackgroundLines } from "@/components/ui/background-lines";
import { CreateRoomModal } from "@/components/modals/CreateRoomModal";
import { JoinRoomModal } from "@/components/modals/JoinRoomModal";
import * as motion from "motion/react-client";
import {
  Lock,
  Zap,
  Users,
  Plus,
  LogIn,
  Trash2,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

const features = [
  {
    icon: <Trash2 className="w-5 h-5" />,
    title: "Auto-Destruct",
    description: "Rooms vanish the moment everyone leaves. Zero footprint.",
  },
  {
    icon: <Lock className="w-5 h-5" />,
    title: "No Accounts",
    description: "Jump in with just a username. No sign-ups, no passwords.",
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: "Real-Time",
    description: "WebSocket-powered instant delivery with live updates.",
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: "Private Rooms",
    description: "Share a slug to invite. No one else gets in.",
  },
];

export default function HomePage() {
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  return (
    <>
      <BackgroundLines className="min-h-screen flex flex-col items-center justify-center bg-background">
        {/* Radial glow overlay */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="w-[600px] h-[600px] rounded-full bg-violet-600/5 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-3xl mx-auto gap-8">
          {/* Badge */}
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-medium tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
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
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight leading-none">
              <span className="gradient-text">Privora</span>
            </h1>
            <p className="text-muted-foreground text-lg sm:text-xl font-light tracking-wide">
              Private rooms that disappear when you&apos;re done. <br className="hidden sm:block" />
              No trace. No history. Just conversation.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="flex flex-col sm:flex-row gap-3 w-full max-w-sm"
          >
            <button
              id="create-room-btn"
              onClick={() => setShowCreate(true)}
              className="group relative flex-1 flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl font-semibold text-sm tracking-wide overflow-hidden transition-all duration-200 bg-violet-600 hover:bg-violet-500 text-white glow-violet-sm hover:glow-violet active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 transition-transform group-hover:rotate-90 duration-200" />
              Create Room
            </button>
            <button
              id="join-room-btn"
              onClick={() => setShowJoin(true)}
              className="group flex-1 flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl font-semibold text-sm tracking-wide border border-border hover:border-violet-500/50 bg-muted/30 hover:bg-muted/60 text-foreground transition-all duration-200 active:scale-[0.98]"
            >
              <LogIn className="w-4 h-4 transition-transform group-hover:translate-x-0.5 duration-200" />
              Join Room
            </button>
          </motion.div>

          {/* Divider */}
          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="w-full max-w-sm flex items-center gap-4"
          >
            <div className="flex-1 h-px bg-border" />
            <span className="text-muted-foreground text-xs tracking-widest uppercase">Features</span>
            <div className="flex-1 h-px bg-border" />
          </motion.div>

          {/* Feature cards */}
          <motion.div
            custom={4}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full"
          >
            {features.map((f, i) => (
              <div
                key={i}
                className="feature-card glass-card rounded-xl p-4 flex flex-col gap-2 text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-violet-500/15 border border-violet-500/20 flex items-center justify-center text-violet-400">
                  {f.icon}
                </div>
                <p className="text-xs font-semibold text-foreground">{f.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.description}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </BackgroundLines>

      {/* Modals */}
      <CreateRoomModal open={showCreate} onClose={() => setShowCreate(false)} />
      <JoinRoomModal open={showJoin} onClose={() => setShowJoin(false)} />
    </>
  );
}