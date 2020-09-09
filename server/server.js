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

const {generateMessage, generateLocationMessage} = require('./utils/message');
const {isRealString} = require('./utils/validation');
const {Users} = require('./utils/users');
const publicPath = path.join(__dirname, '../public');
var app = express();
var server = http.createServer(app);
var io = socketIO(server);
var users = new Users();
app.use(express.static(publicPath));
server.listen(process.env.PORT, () => {
  console.log(`Server is up on port ${process.env.PORT}`);
});
io.on('connection', (socket) => {
  console.log('New user connected');
  socket.on('join', (params, callback) => {
  if(!isRealString(params.name) || !isRealString(params.room)){
      return callback('Name and Room name  are required')
    } 
  socket.join(params.room);
  users.removeUser(socket.id);
  users.addUser(socket.id, params.name, params.room);
  console.log(socket.id);
  socket.emit('newMessage',generateMessage('Admin', 'Welcome to the chat app.'));
  socket.broadcast.to(params.room).emit('newMessage',generateMessage ('Admin', `${params.name} has joined.`));
  io.to(params.room).emit('updateUserList', users.getUserList(params.room));
  //socket.leave(params.room);
  //io.emit ->io.onconnection(params.room).emit;
  //socket.broadcast.emit -> socket.broadcast.to(params.room);
   callback();
});

  socket.on('disconnect', () => {
      console.log('User was disconnected');
      var user = users.removeUser(socket.id);
      if(user){
        io.to(user.room).emit('updateUserList', users.getUserList(user.room));
        io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left.`));
      }
    });

  socket.on('createMessage', (message, callback) => {
    console.log('New message arrived', message);
    socket.broadcast.emit('newMessage',generateMessage (message.from, message.text));
    callback('Server callback');
  });

  socket.on('createLocationMessage', (coords) => {
    io.emit('newLocationMessage', generateLocationMessage('Admin', coords.latitude, coords.longitude));
  });

});
