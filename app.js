var express = require('express');
var urls = require('./server/urls');
var connect = require('./server/connect');
var GameStateManager = require('./server/game_state_manager');
var g_image_search = require('./server/g_image_search');
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
  g_image_search.init().then(function() {
    urls.init(app);
    connect.init(http);
    var game_state_manager = new GameStateManager();

    // A new game has started for this user.
    game_state_manager.add_handler('start game', function(player, data) {
      console.log('game starting');
      player.user.socket.emit('start game', data);
    });
    
    // Points have been updated for this user.
    game_state_manager.add_handler('update points', function(player, data) {
      console.log('update points');
      if (data.myPoints !== null && player && player.user) {
        player.user.socket.emit('update points', data.myPoints);
      }
      connect.emit('update board', {allPoints: data.allPoints.slice(0, 10), totalPlayers: data.allPoints.length});
    });
    
    // Idle between sessions, allow the user to continue when they want.
    game_state_manager.add_handler('start idle', function(player) {
      console.log('idling...');
      player.user.socket.emit('start idle');
    });

    // User is now starting the judging process.
    game_state_manager.add_handler('start judging', function(player, data) {
      console.log('judging');
      player.user.socket.emit('start judging', data);
    });

    // User should now view a summary of the session they previously participated in.
    game_state_manager.add_handler('start summary', function(player, data) {
      console.log('summary for', player.name);
      player.user.socket.emit('start summary', data);
    });

    // New user has connected (navigated to the website).
    connect.on('connected', function(user, name) {
      console.log('user connected');
      var player = game_state_manager.create_new_player({name: 'Observer', user: user});
      user.player = player;
      user.socket.emit('new connection');

      game_state_manager.clean_game_sessions();
      game_state_manager.update_score_board(player);
      connect.emit('debug image counts', g_image_search.getImageCounts());
    });

    // New user has submitted their name, and can now start playing.
    connect.on('start game', function(user, name) {
      console.log('Welcome', name);
      user.player.name = name;
      game_state_manager.update_player_state(user.player);
    });

    // Generic game event message that is propagated to this players current state.
    connect.on('game event', function(user, event) {
      if (user && user.player && user.player.state) {
        console.log('game event', event.name);
        user.player.state.on_event(game_state_manager, event);
        game_state_manager.clean_game_sessions();
      }
    });

    // Player has left the browser page.
    connect.on('disconnect', function(user, event) {
        console.log('user disconnected');
        game_state_manager.remove_player_connection(user.player);
        user.disconnect(game_state_manager);
        game_state_manager.clean_game_sessions();
        //user.player.state.on_event(game_state_manager, {name: 'disconnect'});
    });

    /////////////////////////////////////////////////////////////////////


    // DEBUGGING Communication

    // Alert the player of how many live sessions exist currently.
    game_state_manager.add_handler('debug session count', function(player, data) {
      console.log('debug session count');
      connect.emit('debug session count', data);
    });

    // Send all data for the currently viewed session to the player.
    // game_state_manager.add_handler('debug session data', function(player, data) {
    //   console.log('debug session data');
    //   player.user.socket.emit('debug session data', data);
    // });

    // Alert the player of the current image library sizes.
    g_image_search.on_library_changed(function(data) {
      console.log('debug image counts');
      connect.emit('debug image counts', data);
    });

    // Player has requested to view a specific game session.
    connect.on('debug session data', function(user, sessionIndex) {
      console.log('requesting data for session:', sessionIndex);
      var summaryData = game_state_manager.get_summary_for_session(sessionIndex);
      user.socket.emit('debug session data', summaryData);
    });
  });
}
