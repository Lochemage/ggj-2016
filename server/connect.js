var User = require('./user');
var handlers = {};

module.exports.init = function(http) {
  var io = require('socket.io')(http);
  io.on('connection', function(socket) {
    var user = new User();
    user.socket = socket;

    // Register all handlers
    for (var handler in handlers) {
      (function(handlerName) {
        socket.on(handlerName, function(data) {
          for (var i = 0; i < handlers[handlerName].length; ++i) {
            handlers[handlerName][i](user, data);
          }
        });
      })(handler);
    }

    if (handlers.hasOwnProperty('connected')) {
      for (var i = 0; i < handlers.connected.length; ++i) {
        handlers.connected[i](user);
      }
    }
  });
  
  // Sends a message to all users.
  module.exports.emit = function(type, data) {
    io.emit(type, data);
  };
}

// Register your own event handler for when a message type is triggered.
// The callback should accept two parameters, the user object receiving
// the message and the data of that message.
module.exports.on = function(type, callback) {
  if (!handlers.hasOwnProperty(type)) {
    handlers[type] = [];
  }

  handlers[type].push(callback);
};

