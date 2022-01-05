const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('login', (name) => {
    io.emit('login', name);

    socket.on('chat message', (msg) => {
      io.emit('chat message', { name, msg });
    });

    socket.on('typing', () => {
      console.log('typing')
      io.emit('typing', name);
    })
  })
  
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});