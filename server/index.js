#!/usr/bin/env node

/**
 * Module dependencies.
 */

var app = require('../app');
var debug = require('debug')('chat_node_express:server');
var http = require('http');

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '1111');
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

server.listen(port, function() {
  console.log('Express server listening on port ' + port);
});

var io = require('socket.io')(server);

var usernames = {};

io.on('connection', function (socket) {

  socket.on('adduser', function(username){
    // we store the username in the socket session for this client
    socket.username = username;
    // add the client's username to the global list
    usernames[username] = username;
    // echo user
    socket.emit('updatechat', 'SERVER', 'you have connected');
    // echo globally
    socket.broadcast.emit('updatechat', 'SERVER', username + ' has connected');
    // update the list of users in chat, client-side
    io.sockets.emit('updateusers', usernames);
  });

  socket.on('disconnect', function () {
    delete usernames[socket.username];

    io.sockets.emit('updateusers', usernames);

    socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
  });

  socket.on('sendchat', function (msg) {
    // we tell the client to execute 'updatechat' with 2 parameters
    io.emit('updatechat', socket.username, msg);
  });
});


/**
 * Listen on provided port, on all network interfaces.
 */

//server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
