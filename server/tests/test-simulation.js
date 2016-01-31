var assert = require('assert');

var matchmaker = require('../matchmaker');
var GameSession = require('../game_session');
var Player = require('../player');
var GameStateManager = require('../game_state_manager');

describe('GameSimulation', function() {
    this.timeout(10000);
    it('normal', function(done) {
        var game_state_manager = new GameStateManager();
        var user_data = {};
        var player = game_state_manager.create_new_player(user_data);
        game_state_manager.assign_player_to_game(player, function(game_session) {
            assert(game_state_manager.players.length, 1);
            assert(game_state_manager.game_sessions.length, 1);
            assert(game_state_manager.game_sessions[0].slots.length, 1);
            assert(game_state_manager.game_sessions[0].player_is_in_slot(player, 0));
            done();
        });
        
    });
});