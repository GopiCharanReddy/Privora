import http from "http"
import express, { urlencoded } from "express"
import { setupWs } from "./ws/server.ts"
import userRoute from "./routes/user.routes.ts"
import roomRoute from "./routes/room.routes.ts"
import messageRoute from "./routes/message.routes.ts"
import dotenv from "dotenv"
import "./ws/workers/chat.worker.ts"
import cors from "cors"

dotenv.config()

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
}

const app = express()
app.use(cors(corsOptions))
const router: express.Router = express.Router()
const server = http.createServer(app)
const PORT = process.env.PORT || 8080

setupWs(server)

app.use(express.json({ limit: "15kb" }))
app.use(urlencoded({ extended: true, limit: "15kb" }))
app.use(express.static("public"))

router.use("/users", userRoute)
router.use("/rooms", roomRoute)
router.use("/messages", messageRoute)

app.use("/api/v1", router)

app.use((req, res) => {
  res.status(404).json({
    error: "Route not found.",
  })
})

server.listen(PORT, () => {
  console.log("Server is listening on PORT: ", PORT)
})
