![alt text](opengraph-image.jpg)
# Privora

A full-stack real-time chat application featuring instant messaging, secure chat rooms which get deleted once everyone leaves, and a robust background job processing system to ensure high performance

**Frontend URL:** [https://privora.chaxan.in](https://privora.chaxan.in)

## Features
- **Real-Time Messaging:** Instant message delivery and broadcasting using native WebSockets (`ws`).
- **Secure Chat Rooms:** Create and join distinct chat rooms for private conversations.
- **Background Job Processing:** Messages are processed and handled asynchronously using BullMQ and Redis.
- **Modern UI:** Built with shadcn/ui, Tailwind CSS v4, and smooth framer-motion animations.

## Tech Stack
### Frontend
- Next.js 16 (App Router)
- React 19
- Tailwind CSS v4 & shadcn/ui
- Motion (Animations)
- Axios (Data fetching)

### Backend
- Node.js & Express.js
- WebSockets (`ws`)
- PostgreSQL (Neon Serverless)
- Drizzle ORM
- BullMQ & ioredis (Message Queue/Workers)

## Architecture

### Overview
Privora follows a scalable, decoupled architecture to ensure real-time message delivery and high performance:

```text
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Next.js   │─────▶│ Express API  │─────▶│  PostgreSQL │
│   Client    │  HTTP│   Routes     │      │   Database  │
└─────────────┘      └──────────────┘      └─────────────┘
       │                     │                      ▲
       │                     │                      │
       └─────────────────────┼──────────────────────┘
                   WebSocket │
                    ┌────────▼────────┐
                    │ WebSocket Server│
                    └─────────────────┘
                             │ Enqueue Job
                    ┌────────▼────────┐
                    │ BullMQ / Redis  │
                    └─────────────────┘
                             │ Process Job
                    ┌────────▼────────┐
                    │  Chat Workers   │
                    └─────────────────┘
```

### Data Flow
1. **Connection:** Client establishes a WebSocket connection with the server.
2. **Messaging:** Messages are emitted from the client to the WebSocket Server.
3. **Broadcasting:** The WebSocket Server instantly broadcasts the message to all clients connected to the same room.
4. **Persistence:** The WebSocket Server enqueues a standard background job into Redis via BullMQ.
5. **Background Worker:** A dedicated background worker picks up the job and safely persists the messages into the PostgreSQL database via Drizzle ORM without blocking the real-time servers.

### Key Design Decisions
- **Decoupled Persistence:** Using BullMQ workers offloads database writes from the main WebSocket thread, ensuring that chat remains perfectly real-time under high load.
- **Native WebSockets over Socket.IO:** Standard `ws` is used for lightweight performance with direct persistent connections.
- **PostgreSQL via Neon Serverless:** Offers high availability and connection pooling directly compatible with Drizzle ORM.

## Getting Started

### Prerequisites
- Node.js (LTS recommended)
- `pnpm` >= 9.x
- PostgreSQL Database (e.g., Neon or local)
- Redis Server (for BullMQ)

### Setup

**1. Clone the repository:**
```bash
git clone https://github.com/GopiCharanReddy/Privora.git
cd chat
```

**2. Install frontend dependencies:**
```bash
pnpm install
```

**3. Install backend dependencies:**
```bash
cd backend
pnpm install
```

**4. Set up environment variables:**
Create `.env` files in both the root directory and the `backend/` directory.

**Backend required environment variables (`backend/.env`):**
```bash
DATABASE_URL="postgres://user:password@host/db"
REDIS_URL="redis://localhost:6379"
REDIS_PASSWORD="your_redis_password"
FRONTEND_URL="http://localhost:3000"
PORT=8080
```

**Frontend required environment variables (`.env`):**
```bash
NEXT_PUBLIC_API_URL="http://localhost:8080"
```

**5. Start the development servers:**
```bash
# In the root directory (Frontend)
pnpm dev

# In the /backend directory (Backend)
pnpm dev
```
Open `http://localhost:3000` in your browser.

## Project Structure
```text
Privora/
├── app/                           # Next.js App Router
│   ├── room/                      # Room routes
│   ├── layout.tsx                 # Room layout
│   ├── page.tsx                   # Home/landing page
│   └── globals.css                # Global styles
├── backend/                       # Node.js Backend Server
│   ├── src/
│   │   ├── routes/                # Express API REST Routes
│   │   ├── ws/                    # WebSocket server handling
│   │   │   └── workers/           # BullMQ Workers
│   │   └── index.ts               # Server Entrypoint
|   ├── supabase/                  # Supabase setup
│   │   └── migrations/            # Supabase migrations
│   ├── drizzle.config.ts          # Drizzle setup
|   ├── tsconfig.json              # TypeScript config
│   └── package.json               # Backend Dependencies
├── components/                    # React components
│   └── ui/                        # shadcn/ui components
├── hooks/                         # Custom React hooks
├── lib/                           # Utility functions
├── package.json                   # Frontend Dependencies
└── README.md                      # This file
```

## Development
- **Type Safety:** TypeScript is used extensively across both the frontend and backend.
- **Real-Time Testing:** WebSockets are set up inherently with Express; making testing instantaneous across multiple browser tabs pointing at the same room.

## Production
- **Deployment:** The Next.js frontend can be deployed easily on Vercel or any Node.js host. The Node backend should be deployed to a stateful container/server capable of running WebSockets and Redis (e.g., Railway, Render, DigitalOcean).

## Security
- Room IDs are unguessable (nanoid)
- Input validation via Zod schemas
- Consider rate limiting for production

## License
See LICENSE file for details.