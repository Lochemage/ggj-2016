var Player = require('./Player');
var handlers = {};

module.exports.init = function(http) {
  var io = require('socket.io')(http);
  io.on('connection', function(socket) {
    console.log('Player connected');

    var player = new Player();
    player.socket = socket;

    // Register all handlers
    for (var handler in handlers) {
      (function(handlerName) {
        socket.on(handlerName, function(data) {
          for (var i = 0; i < handlers[handlerName].length; ++i) {
            handlers[handlerName][i](player, data);
          }
        });
      })(handler);
    }
  });
  
  // Sends a message to all players.
  module.exports.emit = function(type, data) {
    io.emit(type, data);
  };
}

// Register your own event handler for when a message type is triggered.
// The callback should accept two parameters, the player object receiving
// the message and the message data.
module.exports.on = function(type, callback) {
  if (!handlers.hasOwnProperty(type)) {
    handlers[type] = [];
  }

  handlers[type].push(callback);
};

