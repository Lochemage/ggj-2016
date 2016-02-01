var assert = require('assert');

var Matchmaker = require('../matchmaker');
var GameSession = require('../game_session');
var Player = require('../player');
var GameStateManager = require('../game_state_manager');

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
            session.assign_player_to_slot(new Player({name: 'name', user: 'user'}), 0);
            assert.equal(session.get_next_available_slot(), -1);
        });
    });
    describe('player_is_in_slot', function() {
        it('slot empty', function() {
            var session = new GameSession();
            var player = new Player({name: 'name', user: 'user'});
            assert.equal(session.player_is_in_slot(player, 0), false);
        });
        it('bad slot', function() {
            var session = new GameSession();
            var player = new Player({name: 'name', user: 'user'});
            assert.equal(session.player_is_in_slot(player, -1), false);
        });
        it('bad player', function() {
            var session = new GameSession();
            assert.equal(session.player_is_in_slot(null, -1), false);
        });
        it('player in slot', function() {
            var session = new GameSession();
            var player = new Player({name: 'name', user: 'user'});
            session.assign_player_to_slot(player, 0);
            assert.equal(session.player_is_in_slot(player, 0), true);
        });
        it('different player in slot', function() {
            var session = new GameSession();
            var player1 = new Player({name: 'name', user: 'user'});
            var player2 = new Player({name: 'name', user: 'user'});
            session.assign_player_to_slot(player1, 0);
            assert.equal(session.player_is_in_slot(player2, 0), false);
        });
    });
    describe('assign_player_to_slot', function() {
        it('assign in first spot okay', function() {
            var session = new GameSession();
            var result = session.assign_player_to_slot(new Player({name: 'name', user: 'user'}), 0);
            assert.equal(result, true);
        });
        it('assign negative spot', function() {
            var session = new GameSession();
            var result = session.assign_player_to_slot(new Player({name: 'name', user: 'user'}), -1);
            assert.equal(result, false);
        });
        it('assign spot off end', function() {
            var session = new GameSession();
            var result = session.assign_player_to_slot(new Player({name: 'name', user: 'user'}), 1);
            assert.equal(result, false);
        });
        it('try assign same player twice', function() {
            var session = new GameSession();
            var player = new Player({name: 'name', user: 'user'});
            var result = session.assign_player_to_slot(player, 0);
            assert.equal(result, true);
            result = session.assign_player_to_slot(player, 0);
            assert.equal(result, true);
        });
        it('try assign different players same spot', function() {
            var session = new GameSession();
            var player1 = new Player({name: 'name', user: 'user'});
            var player2 = new Player({name: 'name', user: 'user'});
            var result = session.assign_player_to_slot(player1, 0);
            assert.equal(result, true);
            result = session.assign_player_to_slot(player2, 0);
            assert.equal(result, false);
        });
    });
    describe('remove_player_from_slot', function() {
        describe('basic test', function() {
            var session = new GameSession();
            //session.assign_player_to_slot()
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
    var assignable_players = [new Player({name: 'tom', user: 'user'}), new Player({name: 'dick', user: 'user'}), new Player({name: 'harry', user: 'user'})]
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

describe('GameStateManager', function() {
    // this.timeout(10000);
    it('update_player_state_existing_session', function(done) {
        var game_state_manager = new GameStateManager();
        var fake_game_session = new GameSession([]);
        var fake_player = new Player({name: 'name', user: 'user'});
        game_state_manager.create_new_player({name: 'name', user: 'user'});
        var success = fake_game_session.assign_player_to_slot(fake_player, 0);
        assert(success);
        // console.log('fake_game_session', fake_game_session)
        fake_game_session.save_image_to_slot(0, 'image_path');
        game_state_manager.game_sessions.push(fake_game_session);
        assert.equal(game_state_manager.game_sessions[0].slots[0].image_path, 'image_path');
        assert.equal(game_state_manager.game_sessions[0].slots.length, 3);
        assert.equal(game_state_manager.game_sessions.length, 1);

        
        var player = game_state_manager.create_new_player({name: 'name', user: 'user'});
        assert.equal(game_state_manager.players.length, 2);
        game_state_manager.update_player_state(player);

        var game_session = player.curr_session;
        assert.equal(game_session, fake_game_session);
        assert.equal(game_state_manager.game_sessions.length, 1);
        assert.equal(game_state_manager.game_sessions[0].available_slots.length, 1);
        assert.equal(game_state_manager.game_sessions[0].available_slots[0], 2);
        assert.equal(game_state_manager.game_sessions[0].slots.length, 3);
        assert(game_state_manager.game_sessions[0].player_is_in_slot(player, 1));
        done();
    });
    it('test_get_score_list', function() {
        var game_state_manager = new GameStateManager();
        var fake_game_session = new GameSession([]);
        game_state_manager.create_new_player({name: 'name_1', user: 'user'});
        game_state_manager.create_new_player({name: 'name_2', user: 'user'});
        game_state_manager.players[0].points = 5;
        game_state_manager.players[1].points = 100;

        score_data = game_state_manager.get_score_list();
        assert.equal(score_data.length, 2);
        assert.equal(score_data[0].player, 'name_2');
        assert.equal(score_data[0].score, 100);
        assert.equal(score_data[1].player, 'name_1');
        assert.equal(score_data[1].score, 5);

    });
});