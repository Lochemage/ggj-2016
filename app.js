var express = require('express');
var urls = require('./server/urls');
var connect = require('./server/connect');
var game_state_manager = require('./server/game_state_manager');
var app = express();
var http = require('http').Server(app);
var tester = require('./server/tester');

// process arguments.
var testing = false;
var specificTest = false;
process.argv.forEach(function(val, index, array) {
  if (val === 'test' || val === 'tests') {
    console.log('- Running unit tests.');
    testing = true;
  } else if (testing && val) {
    console.log('- Only run "test-' + val + '.js"');
    specificTest = val;
  }
});

var listener = http.listen(process.env.PORT || 5555, function() {
  var host = listener.address().address;
  var port = listener.address().port;

  console.log("=====================================================");
  console.log('Server listening on http://' + (host == '::'? 'localhost': host) + ":" + port);
  console.log("Press CTRL+C to shutdown the server.");
  console.log("=====================================================\n");
});

if (testing) {
  tester.run(specificTest).then(function() {
    console.log('Passed!');
    process.exit();
  }).catch(function(count) {
    console.log(count.toString(), 'Failed!');
    process.exit(1);
  });
} else {
  urls.init(app);
  connect.init(http);
  game_state_manager.init();

  // Temporary, implemented chat system with the new connect register system.
  connect.on('chat message', function(user, data) {
    connect.emit('chat message', data);
  });

  connect.on('disconnect', function(user, data) {
    console.log('User disconnected');
  });
}