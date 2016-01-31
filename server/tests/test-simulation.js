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
    beforeEach('clear handlers', function() {
        game_state_manager.clear_handlers("start game");
    });
    it('first player joins', function(done) {
        var player = __add_player();
        game_state_manager.assign_player_to_game(player, function(game_session) {
            assert.equal(game_state_manager.players.length, 1);
            console.log('game_state_manager.game_sessions.length: ' + game_state_manager.game_sessions.length)
            assert.equal(game_state_manager.game_sessions.length, 1);
            assert.equal(game_state_manager.game_sessions[0].slots.length, 1);
            assert.equal(game_state_manager.game_sessions[0].original_images.length, 4);
            assert(game_state_manager.game_sessions[0].player_is_in_slot(player, 0));
            assert(players[0].curr_session != null);
            done();
        });
    });
    it('second player soon after', function(done) {
        var player = __add_player();
        game_state_manager.assign_player_to_game(player, function(game_session) {
            assert.equal(game_state_manager.game_sessions.length, 2);
            assert(players[0].curr_session != players[1].curr_session);
            assert(players[1].curr_session != null);
            done();
        });
    });
    var first_image = 'first image';
    it('first player submits image', function() {
        game_state_manager.player_submit_image(players[0], first_image);
        assert.equal(game_state_manager.game_sessions.length, 2);
        assert.equal(game_state_manager.game_sessions[0].slots.length, 3);
        assert.equal(game_state_manager.game_sessions[1].slots.length, 1);
    });
    it('third player joins', function(done) {
        var player = __add_player();
        game_state_manager.add_handler("start game", function (player, data) {
            assert.equal(data.image, first_image);
        });
        game_state_manager.assign_player_to_game(player, function(game_session) {
            assert.equal(game_state_manager.game_sessions.length, 2);
            assert.equal(game_state_manager.game_sessions[0].slots.length, 3);
            assert.equal(game_state_manager.game_sessions[1].slots.length, 1);
            assert.equal(player.curr_session, game_state_manager.game_sessions[0]);
            done();
        });
    });
    var second_image = 'second image';
    it('second player submits image', function() {
        game_state_manager.player_submit_image(players[1], second_image);
        assert.equal(game_state_manager.game_sessions.length, 2);
        assert.equal(game_state_manager.game_sessions[0].slots.length, 3);
        assert.equal(game_state_manager.game_sessions[1].slots.length, 3);
    });
    it('first player decides to play again', function(done) {
        game_state_manager.add_handler("start game", function (player, data) {
            assert.equal(data.image, second_image);
        });
        game_state_manager.assign_player_to_game(players[0], function(game_session) {
            assert.equal(game_state_manager.game_sessions.length, 2);
            assert.equal(players[0].curr_session, game_state_manager.game_sessions[1]);
            assert.equal(game_state_manager.game_sessions[1].get_player_slot_index(players[0]), 1);
            done();
        });
    });
    var third_image = 'third image';
    it('third player submits image', function() {
        game_state_manager.player_submit_image(players[2], third_image);
        assert.equal(game_state_manager.game_sessions.length, 2);
        assert.equal(game_state_manager.game_sessions[0].slots.length, 5);
        assert.equal(game_state_manager.game_sessions[1].slots.length, 3);
    });
    it('second player decides to play again', function(done) {
        game_state_manager.add_handler("start game", function (player, data) {
            assert.equal(data.image, first_image);
        });
        game_state_manager.assign_player_to_game(players[1], function(game_session) {
            assert.equal(game_state_manager.game_sessions.length, 2);
            assert.equal(players[1].curr_session, game_state_manager.game_sessions[0]);
            assert.equal(game_state_manager.game_sessions[0].get_player_slot_index(players[1]), 2);
            done();
        });
    });
    it('players 4 and 5 join', function(done) {
        var player = __add_player();
        game_state_manager.add_handler("start game", function (player, data) {
            assert.equal(data.image, third_image);
        });
        game_state_manager.assign_player_to_game(player, function(game_session) {
            assert.equal(game_state_manager.game_sessions.length, 2);
            assert.equal(game_state_manager.game_sessions[0].slots.length, 5);
            assert.equal(game_state_manager.game_sessions[1].slots.length, 3);
            assert.equal(player.curr_session, game_state_manager.game_sessions[0]);
            assert.equal(game_state_manager.game_sessions[0].get_player_slot_index(player), 3);

            player = __add_player();
            game_state_manager.assign_player_to_game(player, function(game_session) {
                assert.equal(player.curr_session, game_state_manager.game_sessions[0]);
                assert.equal(game_state_manager.game_sessions[0].get_player_slot_index(player), 4);
                done();
            });
        });
    });
    it('player 6 joins', function(done) {
        var player = __add_player();
        game_state_manager.add_handler("start game", function (player, data) {
            assert.equal(data.image, second_image);
        });
        game_state_manager.assign_player_to_game(player, function(game_session) {
            assert.equal(player.curr_session, game_state_manager.game_sessions[1]);
            assert.equal(game_state_manager.game_sessions[1].get_player_slot_index(player), 2);
            done();
        });
    });
});