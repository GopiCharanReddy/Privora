import WebSocket, { WebSocketServer } from 'ws';
const wss = new WebSocketServer({
    port: 8080
});
wss.on('connection', (ws) => {
    ws.on('error', console.error);
    ws.on('messgae', (data) => {
        console.log("received data: ", data);
        ws.send(data);
    });
    ws.send("Websocket connection successfull.");
});
console.log("Websocket started on port 8080");
//# sourceMappingURL=index.js.map