import { useEffect, useRef } from "react"
import Header from "./Header"
import { useWebSocket } from "../hooks/WebSocketContext"

type CreateRoomProps = {
  onRoomCreated: (roomId: string, count?: number) => void
}

const CreateRoom = ({ onRoomCreated }: CreateRoomProps) => {
  const nameRef = useRef<HTMLInputElement>(null)
  const roomIDRef = useRef<HTMLInputElement>(null)
  const { socket, isConnected, lastMessage } = useWebSocket()

  useEffect(() => {
    if (!lastMessage) return
    if (lastMessage && lastMessage.type === "roomCreated") {
      const payload = lastMessage.payload as
        | { roomId: string; userCount: number }
        | undefined
      const newRoomId = payload?.roomId
      const initialCount = payload?.userCount
      if (newRoomId) onRoomCreated(newRoomId, initialCount)
    }
    if (lastMessage.type === "joined") {
      const payload = lastMessage.payload as
        | { roomId: string; userCount: number }
        | undefined
      if (payload?.roomId) onRoomCreated(payload.roomId, payload.userCount)
    }
  }, [onRoomCreated, lastMessage])

  const handleClick = () => {
    if (isConnected && socket && nameRef.current?.value) {
      socket.send(
        JSON.stringify({
          type: "create",
          payload: {
            name: nameRef.current.value,
          },
        })
      )
    } else {
      console.log("Socket not connected or name is empty.")
    }
  }
  const handleJoin = () => {
    if (socket && nameRef.current?.value && roomIDRef.current?.value) {
      socket.send(
        JSON.stringify({
          type: "join",
          payload: {
            name: nameRef.current.value,
            roomId: roomIDRef.current.value,
          },
        })
      )
    } else {
      console.log("Error while joining room.")
    }
  }
  return (
    <div className="w-full">
      <div className="flex w-full flex-col gap-y-3 rounded-lg border-neutral-400 p-4 text-white outline outline-neutral-800 sm:gap-y-4 sm:p-6">
        <div>
          <Header />
        </div>
        <button
          onClick={handleClick}
          className="flex w-full cursor-pointer justify-center rounded-md bg-white p-2 text-lg font-semibold text-black hover:bg-neutral-200 sm:p-3 sm:text-xl"
        >
          Create New Room
        </button>
        {!isConnected && (
          <p className="text-sm text-neutral-300 sm:text-base">
            Connecting to server...
          </p>
        )}
        <input
          ref={nameRef}
          type="text"
          placeholder="Enter your name"
          className="w-full rounded-md border border-neutral-800 p-2 text-sm text-neutral-100 outline-none focus:border-neutral-100 sm:p-3 sm:text-base"
        />
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
          <input
            ref={roomIDRef}
            type="text"
            placeholder="Enter Room Code"
            className="w-full rounded-md border border-neutral-800 p-2 text-sm text-neutral-100 outline-none focus:border-neutral-100 sm:p-3 sm:text-base"
          />
          <button
            onClick={handleJoin}
            className="w-full cursor-pointer rounded-lg bg-white p-2 text-sm font-semibold text-black hover:bg-neutral-200 sm:w-auto sm:min-w-[120px] sm:p-3 sm:text-base"
          >
            Join Room
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreateRoom
