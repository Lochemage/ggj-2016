var assert = require('assert');

var matchmaker = require('../matchmaker');
var GameSession = require('../game_session');
var Player = require('../player');
var GameStateManager = require('../game_state_manager');

describe('GameSimulation', function() {
    //this.timeout(10000);
    var game_state_manager = new GameStateManager();
    var players = [];

    function __add_player() {
        var user_data = {};
        var player = game_state_manager.create_new_player(user_data);
        players.push(player);
        return player;
    };
    function player_submit_image(player, image_path) {
        player.state.on_event(game_state_manager, {name: 'submit drawing', image_path: image_path});
    }
    function player_quit(player) {
        player.disconnect(game_state_manager);
        //player.state.on_event(game_state_manager, {name: 'disconnect'});
    }
    beforeEach('clear handlers', function() {
        game_state_manager.clear_handlers("start game");
    });
    it('first player joins', function(done) {
        var player = __add_player();
        game_state_manager.update_player_state(player);
        var game_session = player.curr_session;
        assert.equal(game_state_manager.players.length, 1);
        console.log('game_state_manager.game_sessions.length: ' + game_state_manager.game_sessions.length)
        assert.equal(game_state_manager.game_sessions.length, 1);
        assert.equal(game_state_manager.game_sessions[0].slots.length, 1);
        assert.equal(game_state_manager.game_sessions[0].original_images.length, 4);
        assert(game_state_manager.game_sessions[0].player_is_in_slot(player, 0));
        assert(players[0].curr_session != null);
        done();
    });
    it('second player soon after', function(done) {
        var player = __add_player();
        game_state_manager.update_player_state(player);
        var game_session = player.curr_session;
        assert.equal(game_state_manager.game_sessions.length, 2);
        assert(players[0].curr_session != players[1].curr_session);
        assert(players[1].curr_session != null);
        done();
    });
    var first_image = 'first image';
    it('first player submits image', function() {
        player_submit_image(players[0], first_image);
        assert.equal(game_state_manager.game_sessions.length, 2);
        assert.equal(game_state_manager.game_sessions[0].slots.length, 3);
        assert.equal(game_state_manager.game_sessions[1].slots.length, 1);
    });
    it('third player joins', function(done) {
        var player = __add_player();
        game_state_manager.add_handler("start game", function (player, data) {
            assert.equal(data.image, first_image);
        });
        game_state_manager.update_player_state(player);
        var game_session = player.curr_session;
        assert.equal(game_state_manager.game_sessions.length, 2);
        assert.equal(game_state_manager.game_sessions[0].slots.length, 3);
        assert.equal(game_state_manager.game_sessions[1].slots.length, 1);
        assert.equal(player.curr_session, game_state_manager.game_sessions[0]);
        done();
    });
    var second_image = 'second image';
    it('second player submits image', function() {
        player_submit_image(players[1], second_image);
        assert.equal(game_state_manager.game_sessions.length, 2);
        assert.equal(game_state_manager.game_sessions[0].slots.length, 3);
        assert.equal(game_state_manager.game_sessions[1].slots.length, 3);
    });
    it('first player decides to play again', function(done) {
        game_state_manager.add_handler("start game", function (player, data) {
            assert.equal(data.image, second_image);
        });
        game_state_manager.update_player_state(players[0]);
        var game_session = players[0].curr_session;
        assert.equal(game_state_manager.game_sessions.length, 2);
        assert.equal(players[0].curr_session, game_state_manager.game_sessions[1]);
        assert.equal(game_state_manager.game_sessions[1].get_player_slot_index(players[0]), 1);
        done();
    });
    var third_image = 'third image';
    it('third player submits image', function() {
        player_submit_image(players[2], third_image);
        assert.equal(game_state_manager.game_sessions.length, 2);
        assert.equal(game_state_manager.game_sessions[0].slots.length, 5);
        assert.equal(game_state_manager.game_sessions[1].slots.length, 3);
    });
    it('second player decides to play again', function(done) {
        game_state_manager.add_handler("start game", function (player, data) {
            assert.equal(data.image, first_image);
        });
        game_state_manager.update_player_state(players[1]);
        var game_session = players[1].curr_session;
        assert.equal(game_state_manager.game_sessions.length, 2);
        assert.equal(players[1].curr_session, game_state_manager.game_sessions[0]);
        assert.equal(game_state_manager.game_sessions[0].get_player_slot_index(players[1]), 2);
        done();
    });
    it('players 4 and 5 join', function(done) {
        var player = __add_player();
        game_state_manager.add_handler("start game", function (player, data) {
            assert.equal(data.image, third_image);
        });
        game_state_manager.update_player_state(player);
        var game_session = player.curr_session;
        assert.equal(game_state_manager.game_sessions.length, 2);
        assert.equal(game_state_manager.game_sessions[0].slots.length, 5);
        assert.equal(game_state_manager.game_sessions[1].slots.length, 3);
        assert.equal(player.curr_session, game_state_manager.game_sessions[0]);
        assert.equal(game_state_manager.game_sessions[0].get_player_slot_index(player), 3);

        player = __add_player();
        game_state_manager.update_player_state(player);
        var game_session = player.curr_session;
        assert.equal(player.curr_session, game_state_manager.game_sessions[0]);
        assert.equal(game_state_manager.game_sessions[0].get_player_slot_index(player), 4);
        done();
    });
    it('player 6 joins', function(done) {
        var player = __add_player();
        game_state_manager.add_handler("start game", function (player, data) {
            assert.equal(data.image, second_image);
        });
        game_state_manager.update_player_state(player);
        var game_session = player.curr_session;
        assert.equal(player.curr_session, game_state_manager.game_sessions[1]);
        assert.equal(game_state_manager.game_sessions[1].get_player_slot_index(player), 2);
        done();
    });
    var fourth_image = "fourth_image";
    it('player 2 submits image', function() {
        player_submit_image(players[1], fourth_image);
        assert.equal(game_state_manager.game_sessions.length, 2);
        assert.equal(game_state_manager.game_sessions[0].slots.length, 7);
        assert.equal(game_state_manager.game_sessions[1].slots.length, 3);
    });
    var fifth_image = 'fifth_image';
    it('player 4 submits image', function() {
        player_submit_image(players[3], fifth_image);
        assert.equal(game_state_manager.game_sessions.length, 2);
        assert.equal(game_state_manager.game_sessions[0].slots.length, 7);
        assert.equal(game_state_manager.game_sessions[1].slots.length, 3);
        assert(!players[3].has_queued_state());
    });
    it('players 7 and 8 join', function(done) {
        var player = __add_player();
        game_state_manager.add_handler("start game", function (player, data) {
            assert.equal(data.image, fourth_image);
        });
        game_state_manager.update_player_state(player);
        var game_session = player.curr_session;
        assert.equal(game_state_manager.game_sessions.length, 2);
        assert.equal(game_state_manager.game_sessions[0].slots.length, 7);
        assert.equal(game_state_manager.game_sessions[1].slots.length, 3);
        assert.equal(player.curr_session, game_state_manager.game_sessions[0]);
        assert.equal(game_state_manager.game_sessions[0].get_player_slot_index(player), 5);

        player = __add_player();
        game_state_manager.update_player_state(player);
        var game_session = player.curr_session;
        assert.equal(player.curr_session, game_state_manager.game_sessions[0]);
        assert.equal(game_state_manager.game_sessions[0].get_player_slot_index(player), 6);
        done();
    });
    // not worrying about players 1 and 2 for now
    it('player 7 bails out', function() {
        player_quit(players[6]);
        assert.equal(game_state_manager.game_sessions.length, 2);
        assert(game_state_manager.game_sessions[0].get_available_slots().indexOf(5) > -1);
    });
    it('player 9 joins', function(done) {
        var player = __add_player();
        game_state_manager.add_handler("start game", function (player, data) {
            assert.equal(data.image, fourth_image);
        });
        game_state_manager.update_player_state(player);
        var game_session = player.curr_session;
        assert.equal(player.curr_session, game_state_manager.game_sessions[0]);
        assert.equal(game_state_manager.game_sessions[0].get_player_slot_index(player), 5);
        done();
    });
});