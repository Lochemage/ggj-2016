var express = require('express');
var urls = require('./server/urls');
var connect = require('./server/connect');
var GameStateManager = require('./server/game_state_manager');
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
    if (typeof count === 'object') {
      count = count.stack;
    }
    console.log(count.toString(), 'Failed!');
    process.exit(1);
  });
} else {
  urls.init(app);
  connect.init(http);
  var game_state_manager = new GameStateManager();

  game_state_manager.add_handler('start game', function(player, data) {
    console.log('game starting');
    player.user.socket.emit('start game', data);
  });

  connect.on('start game', function(user, name) {
    // TODO: Interface with the game state machine to generate a player and assign them to a session.
    console.log('Welcome', name);
    var player = game_state_manager.create_new_player({name: name, user: user});
    user.player = player;
    game_state_manager.assign_player_to_game(player, function(game_session) {
      console.log('assigned player to game');
    });

    // game_state_manager();

    // TEMP: Start a game immediately.
    // user.socket.emit('start game');
  });

  connect.on('submit drawing', function(user, imgData) {
    game_state_manager.player_submit_image(user.player, imgData);
  });
}