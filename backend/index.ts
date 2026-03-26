import WebSocket, { WebSocketServer } from 'ws';


const wss = new WebSocketServer({
  port: 8080
});

wss.on('connection', async function connection(ws, req) {
  ws.on('error', console.error);
  
  ws.on('message', (data) => {
    ws.send(data.toString());
  })

  ws.send("Websocket connection successfull.");
});

console.log("Websocket started on port 8080");