import type { Server } from "http";
import WebSocket, { WebSocketServer } from "ws";


export const setupWs = (server: Server) => {

  const socket = new WebSocketServer({ server });
  
  const clients = new Map();
  
  socket.on('connection', (ws) => {
    const clientId = Math.random().toString(36).substring(2,15);
    clients.set(ws, {id: clientId });
    ws.on('error', console.error);

    ws.on('message', (message) => {
      console.log("Message received is : ", message.toString());

      socket.clients.forEach(client =>  {
        if(client != ws && client.readyState === WebSocket.OPEN) {
          client.send(message.toString());
        }
      })
    })

    ws.on('close', () => {
      console.log(`Client ${clients.get(ws).id} disconnected`);
    })
  })
}