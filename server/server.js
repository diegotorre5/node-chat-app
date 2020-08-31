var env = process.env.NODE_ENV;
if(env === 'development') {
  process.env.PORT = 3000;
} else if (env === 'test') {
  process.env.PORT = 3000;
}

const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const {generateMessage} = require('./utils/message');
const publicPath = path.join(__dirname, '../public');
var app = express();
var server = http.createServer(app);
var io = socketIO(server);
app.use(express.static(publicPath));
server.listen(process.env.PORT, () => {
  console.log(`Server is up on port ${process.env.PORT}`);
});
io.on('connection', (socket) => {
  console.log('New user connected');
  socket.on('disconnect', () => {
      console.log('User was disconnected');
    });

  socket.emit('newMessage',generateMessage('Admin', 'Welcome to the chat app.'));

  socket.broadcast.emit('newMessage',generateMessage ('Admin', 'New user joined.'));

  socket.on('createMessage', (message, callback) => {
    console.log('New message arrived', message);
    socket.broadcast.emit('newMessage',generateMessage (message.from, message.text));
    callback('Server callback');
  });
});
