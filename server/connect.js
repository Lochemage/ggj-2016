
module.exports.init = function(http) {
  var io = require('socket.io')(http);

  io.on('connection', function(socket) {
    console.log('a user connected');

    socket.on('disconnect', function() {
      console.log('user disconnected');
    });

    socket.on('chat message', function(msg) {
      console.log('msg', msg);
      io.emit('chat message', msg);
    });
  });
}
