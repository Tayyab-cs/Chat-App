import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import { Server } from 'socket.io';

dotenv.config();

const app = express();
const { PORT } = process.env;
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from the 'public' directory
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile('index.html');
});

let connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('a user connected');

  // Set nickname for the connected user
  socket.on('setNickName', (nickname) => {
    console.log(socket.id, nickname);
    connectedUsers.set(socket.id, nickname);
    socket.broadcast.emit('userNickNameSet', `${nickname} has joined the chat`);
  });

  // Broadcast a message when someone connects
  socket.broadcast.emit('userConnected', 'A new user has been connected.');

  socket.on('chat message', (msg) => {
    console.log('message: ' + msg);
    io.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');

    // Delete the socket to the disconnected users set
    connectedUsers.delete(socket);

    // Broadcast a message when someone disconnects
    socket.broadcast.emit('userDisconnected', `A user has been disconnected`);
  });
});

server.listen(PORT, () => {
  console.log(`Servering is running on port: ${PORT}`);
});
