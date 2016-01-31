var Matchmaker = require('./matchmaker');
var GameSession = require('./game_session');
var Player = require('./player');
const assert = require('assert');
var g_image_search = require('./g_image_search');
var DrawState = require('./states/draw_state');

function GameStateManager() {
    this.game_sessions = [];
    this.players = [];
    this.matchmaker = new Matchmaker();
    this.handlers = {};
};

GameStateManager.prototype = {
    create_new_player: function(user_data) {
        var player = new Player(user_data);
        // console.log('create player', player);
        this.players.push(player);
        // console.log('this.players: ', this.players);
        return player;
    },

    // start_new_game_session: g_image_search.init(4).then(function (image_url){
    //     console.log('image url: ' + image_url)
    //     }
    // ),
    promise_to_start_new_game_session: function(callback) {
        var self = this;
        g_image_search.promiseImages(4).then(function (image_urls) {
            var game_session = new GameSession(image_urls);
            self.game_sessions.push(game_session);
            callback(game_session);
        }).catch(function(err) {
            console.log(err);
        });
    },

    start_new_game_session: function() {
        var image_urls = g_image_search.provideImages(4);
        var game_session = new GameSession(image_urls);
        this.game_sessions.push(game_session);
        return game_session;
    },

    ///////////////////////////////////////////////////////////////////

    add_handler: function(type, callback) {
        if (!this.handlers.hasOwnProperty(type)) {
            this.handlers[type] = [];
        }
        this.handlers[type].push(callback);
    },
    clear_handlers: function(type) {
        if (this.handlers.hasOwnProperty(type)) {
            this.handlers[type] = [];
        }
    },
    call_handler: function(type, player, data) {
        if(this.handlers.hasOwnProperty(type)) {
            console.log('found', type, 'handler');
            for (var i = 0; i < this.handlers[type].length; ++i) {
                console.log('calling function');
                this.handlers[type][i](player, data);
            }
        }
    },

    ///////////////////////////////////////////////////////////////////

    find_available_judge_session: function(player) {
        var result = null;
        var available_judge_session = player.find_available_judge_session();
        // console.log('available_judge_session: ' + available_judge_session);
        if (available_judge_session.length > 0) {
            // console.log('available_judge_session != []')
            this.matchmaker.assign_player_to_judge(player, available_judge_session[0], available_judge_session[1]);
            player.curr_session = available_judge_session[0];
            var data = {};
            console.log('calling start judge handler');
            this.call_handler('start judge', player, data);
            result = available_judge_session[0];
        }
        return result;
    },
    
    // might be draw session or judge session
    assign_player_to_game: function(player, callback) {
        var judge_session = this.find_available_judge_session(player);
        if (judge_session) {
            callback(judge_session);
            return;
        }

        player.state = new DrawState(player);
        //*
        player.state.on_start(this, callback);
        /*/
        var game_session = this.matchmaker.match_a_player_with_sessions(this.game_sessions, player);
        if (!game_session) {
            var self = this;
            console.log('creating a new game session');
            var game_session = this.start_new_game_session();
            var matched = this.matchmaker.match_a_player_with_a_session(game_session, player);
            assert(matched);
        }
        var parent_image_path = game_session.get_player_parent_image(player);
        assert(parent_image_path != '');
        player.curr_session = game_session;
        console.log('calling start game handler for game session');
        this.call_handler('start game', player, {image: parent_image_path});
        callback(game_session);
        //*/
    },

    ///////////////////////////////////////////////////////////////////

    // might be draw session or judge session
    /*
    assign_player_to_game: function(player, callback) {
        //
        //
        var available_judge_session = player.find_available_judge_session();
        // console.log('available_judge_session: ' + available_judge_session);
        if (available_judge_session.length > 0) {
            // console.log('available_judge_session != []')
            this.matchmaker.assign_player_to_judge(player, available_judge_session[0], available_judge_session[1]);
            player.curr_session = available_judge_session[0];
            var data = {};
            console.log('calling start judge handler');
            this.call_handler('start judge', player, data);
            callback(available_judge_session[0]);
            return;
        }

        //
        player.state = new DrawState(player);
        player.state.on_start(this, callback);
        //
    },
    //*/

    player_submit_image: function(player, image_path) {
        game_session = player.curr_session;
        var player_index = game_session.get_player_slot_index(player);
        game_session.save_image_to_slot(player_index, image_path);

        if (game_session.is_finished()) {
            for (var slotIdx = 3; slotIdx < 7; ++slotIdx) {
                game_session.slots[slotIdx].player.event_queue.push({
                    event_type: 'judge grandparent',
                    game_session: game_session,
                    judge_index: slotIdx
                });
            }
            game_session.slots[0].player.event_queue.push({
                event_type: 'judge grandchildren',
                game_session: game_session,
                judge_index: slotIdx
            });
        }
        player.curr_session = null;
    }
};

module.exports = GameStateManager;
