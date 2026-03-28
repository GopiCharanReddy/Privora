import http from 'http';
import express from 'express';
import { setupWs } from './ws/server.ts';
import userRoute from './routes/user.routes.ts';
import roomRoute from './routes/room.routes.ts';
import messageRoute from './routes/message.routes.ts';

const app = express();

const server = http.createServer(app);
const PORT = process.env.PORT || 8080;

setupWs(server);

app.use('/api/v1');

app.use('/users', userRoute);
app.use('/rooms', roomRoute);
app.use('/messages', messageRoute);

server.listen(PORT, () => {
  console.log('Server is listening on PORT: ', PORT);
});