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

  game_state_manager.add_handler('start judging', function(player, data) {
    console.log('judging');
    player.user.socket.emit('start judging', data);
  });

  game_state_manager.add_handler('start summary', function(player, data) {
    
  });

  connect.on('start game', function(user, name) {
    // user.socket.emit('start judging', {source: 'url', choices: ['1', '2', '3', '4']});
    // return;

    console.log('Welcome', name);
    var player = game_state_manager.create_new_player({name: name, user: user});
    user.player = player;
    game_state_manager.update_player_state(player);
  });

  connect.on('game event', function(user, event) {
    console.log('game event', event.name);
    user.player.state.on_event(game_state_manager, event);
  });

  connect.on('disconnect', function(user, event) {
      user.disconnect(game_state_manager);
      //user.player.state.on_event(game_state_manager, {name: 'disconnect'});
  });

  /////////////////////////////////////////////////////////////////////

  // function processPlayerEvent(player, eventData) {
  //   game_state_manager.processPlayerEvent(player, eventData);
  // }
}
