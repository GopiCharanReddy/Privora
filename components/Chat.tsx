import { useEffect, useRef, useState } from "react"
import Header from "./Header"
import { useWebSocket } from "../hooks/WebSocketContext"

type Message = {
  text: string
  sender: "me" | "them"
}
type ChatProps = {
  roomId: string | null
  initialUserCount: number
}
const Chat = ({ roomId, initialUserCount }: ChatProps) => {
  const [messages, setMessages] = useState<Message[]>([])
  const { socket, clientId, lastMessage } = useWebSocket()
  const inputRef = useRef<HTMLInputElement>(null)
  const [userCount, setUserCount] = useState(initialUserCount)

  useEffect(() => {
    if (!lastMessage) return
    const lastMessageFunction = async () => {
      if (lastMessage) {
        console.log(lastMessage)
        const count = lastMessage.userCount as number | undefined
        if (count !== undefined) {
          setUserCount(count)
        }
        if (
          lastMessage.type === "chatMessage" ||
          lastMessage.type === "message"
        ) {
          if (lastMessage.senderId !== clientId)
            setMessages((prevMessages) => [
              ...prevMessages,
              { text: (lastMessage.message ?? "") as string, sender: "them" },
            ])
        } else if (
          lastMessage.type === "joined" ||
          lastMessage.type === "userLeft"
        ) {
          if (lastMessage.senderId !== clientId && lastMessage.senderId)
            setMessages((prevMessage) => [
              ...prevMessage,
              { text: (lastMessage.message ?? "") as string, sender: "them" },
            ])
        }
      }
    }
    lastMessageFunction()
  }, [lastMessage, clientId])

  const handleClick = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const message = inputRef.current?.value
    if (!message) return
    setMessages((prevMessage) => [
      ...prevMessage,
      { text: message, sender: "me" },
    ])
    if (socket) {
      socket.send(
        JSON.stringify({
          type: "chat",
          payload: {
            message,
            roomId: roomId,
          },
        })
      )
    }
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }
  return (
    <div className="m-auto flex flex-col gap-y-3 rounded-lg border border-neutral-800 p-3 sm:w-3xl sm:gap-y-4 sm:p-4">
      <Header />
      <div className="flex flex-col justify-between gap-1 rounded-lg bg-neutral-800 p-2 sm:flex-row sm:gap-0 sm:p-3">
        <div className="text-sm break-all sm:text-base">{`Room Code: ${roomId}`}</div>
        <div className="text-sm sm:text-base">{`Users ${userCount}/2`}</div>
      </div>
      <div className="flex h-64 w-full flex-col overflow-auto rounded-lg border border-neutral-800 p-3 sm:h-80 sm:p-4 lg:h-94 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-500/40 [&::-webkit-scrollbar-thumb:hover]:bg-slate-500 [&::-webkit-scrollbar-track]:bg-transparent">
        {messages.map((message, index: number) => (
          <div
            className={`mb-2 w-fit max-w-[70%] rounded-lg p-3 text-sm break-words shadow-sm sm:max-w-80 sm:p-4 sm:text-base ${message.sender === "me" ? "ml-auto self-end bg-white text-black" : "mr-auto self-start bg-neutral-800 text-white"}`}
            key={index}
          >
            {message.text}
          </div>
        ))}
      </div>
      <form onSubmit={handleClick} className="flex flex-col gap-2 sm:flex-row">
        <input
          ref={inputRef}
          id="message"
          type="text"
          placeholder="Type a message"
          className="w-full rounded-lg border-2 border-neutral-800 bg-neutral-900 p-2 text-sm text-white placeholder-neutral-400 focus:border-2 focus:border-white focus:outline-none sm:w-[80%] sm:p-3 sm:text-base"
        />
        <button
          type="submit"
          className="mt-2 w-full rounded-lg bg-white p-2 px-4 text-sm font-semibold tracking-wider text-black sm:w-auto sm:p-3 sm:px-12 sm:text-base"
        >
          Send
        </button>
      </form>
    </div>
  )
}

export default Chat
