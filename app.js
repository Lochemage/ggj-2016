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
  
  game_state_manager.add_handler('update points', function(player, data) {
    console.log('update points');
    if (data.myPoints !== null && player && player.user) {
      player.user.socket.emit('update points', data.myPoints);
    }
    connect.emit('update board', {allPoints: data.allPoints.slice(0, 10), totalPlayers: data.allPoints.length});
  });
  
  game_state_manager.add_handler('start idle', function(player) {
    console.log('idling...');
    player.user.socket.emit('start idle');
  });

  game_state_manager.add_handler('start judging', function(player, data) {
    console.log('judging');
    player.user.socket.emit('start judging', data);
  });

  game_state_manager.add_handler('start summary', function(player, data) {
    console.log('summary for', player.name);
    player.user.socket.emit('start summary', data);
  });

  connect.on('connected', function(user, name) {
    console.log('user connected');
    var player = game_state_manager.create_new_player({name: 'Observer', user: user});
    user.player = player;
    user.socket.emit('new connection');

    game_state_manager.clean_game_sessions();
    game_state_manager.update_score_board(player);
  });

  connect.on('start game', function(user, name) {
    console.log('Welcome', name);
    user.player.name = name;
    game_state_manager.update_player_state(user.player);
  });

  connect.on('game event', function(user, event) {
    if (user && user.player && user.player.state) {
      console.log('game event', event.name);
      user.player.state.on_event(game_state_manager, event);
      game_state_manager.clean_game_sessions();
    }
  });

  connect.on('disconnect', function(user, event) {
      console.log('user disconnected');
      game_state_manager.remove_player_connection(user.player);
      user.disconnect(game_state_manager);
      game_state_manager.clean_game_sessions();
      //user.player.state.on_event(game_state_manager, {name: 'disconnect'});
  });

  /////////////////////////////////////////////////////////////////////


  // DEBUGGING Communication

  game_state_manager.add_handler('debug session count', function(player, data) {
    console.log('debug session count');
    connect.emit('debug session count', data);
  });

  game_state_manager.add_handler('debug session data', function(player, data) {
    console.log('debug session data');
    player.user.socket.emit('debug session data', data);
  });
}
