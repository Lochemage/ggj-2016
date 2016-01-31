var assert = require('assert');

var Matchmaker = require('../matchmaker');
var GameSession = require('../game_session');
var Player = require('../player');

describe('GameRules', function() {
    //
});

describe('GameSession', function() {
    describe('constructor', function() {
        it('basic', function() {
            var session = new GameSession();
            assert.equal(session.slots.length, 1);
            assert.equal(session.get_available_slots().length, 1);
        });
    });
    describe('get_next_available_slot', function() {
        it('just created', function() {
            var session = new GameSession();
            assert.equal(session.get_next_available_slot(), 0);
        });
        it('after assigned', function() {
            var session = new GameSession();
            session.assign_player_to_slot(new Player(), 0);
            assert.equal(session.get_next_available_slot(), -1);
        });
    });
    describe('player_is_in_slot', function() {
        it('slot empty', function() {
            var session = new GameSession();
            var player = new Player();
            assert.equal(session.player_is_in_slot(player, 0), false);
        });
        it('bad slot', function() {
            var session = new GameSession();
            var player = new Player();
            assert.equal(session.player_is_in_slot(player, -1), false);
        });
        it('bad player', function() {
            var session = new GameSession();
            assert.equal(session.player_is_in_slot(null, -1), false);
        });
        it('player in slot', function() {
            var session = new GameSession();
            var player = new Player();
            session.assign_player_to_slot(player, 0);
            assert.equal(session.player_is_in_slot(player, 0), true);
        });
        it('different player in slot', function() {
            var session = new GameSession();
            var player1 = new Player();
            var player2 = new Player();
            session.assign_player_to_slot(player1, 0);
            assert.equal(session.player_is_in_slot(player2, 0), false);
        });
    });
    describe('assign_player_to_slot', function() {
        it('assign in first spot okay', function() {
            var session = new GameSession();
            var result = session.assign_player_to_slot(new Player(), 0);
            assert.equal(result, true);
        });
        it('assign negative spot', function() {
            var session = new GameSession();
            var result = session.assign_player_to_slot(new Player(), -1);
            assert.equal(result, false);
        });
        it('assign spot off end', function() {
            var session = new GameSession();
            var result = session.assign_player_to_slot(new Player(), 1);
            assert.equal(result, false);
        });
        it('try assign same player twice', function() {
            var session = new GameSession();
            var player = new Player();
            var result = session.assign_player_to_slot(player, 0);
            assert.equal(result, true);
            result = session.assign_player_to_slot(player, 0);
            assert.equal(result, true);
        });
        it('try assign different players same spot', function() {
            var session = new GameSession();
            var player1 = new Player();
            var player2 = new Player();
            var result = session.assign_player_to_slot(player1, 0);
            assert.equal(result, true);
            result = session.assign_player_to_slot(player2, 0);
            assert.equal(result, false);
        });
    });
    describe('expand', function() {
        //
    });
    describe('expand_row', function() {
        //
    });
    describe('get_index_of_parent', function() {
        //
    });
    describe('get_index_of_first_child', function() {
        //
    });
    describe('has_player_in_slot', function() {
        //
    });
});

describe('Player', function() {
    //
});

describe('Matchmaker', function() {
    var game_session = new GameSession();
    var assignable_players = [new Player('tom'), new Player('dick'), new Player('harry')]
    before('initialization', function() {
        // add code if needed
    });
    describe('make me a match', function() {
        it('make me a match', function(done) {
            var matchmaker = new Matchmaker();
            stillUnassignable = matchmaker.make_me_a_match(game_session, assignable_players)
            done();
            // done(new Error('nope!'));
        });
    });
});
