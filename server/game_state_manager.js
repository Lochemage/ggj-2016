var Matchmaker = require('./matchmaker');
var GameSession = require('./game_session');
var Player = require('./player');
const assert = require('assert');
var g_image_search = require('./g_image_search');

// var DefaultState = require('./states/default_state');
var States = {
    DrawState: require('./states/draw_state'),
    IdleState: require('./states/idle_state')
};

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

    update_player_state: function(player) {
        var judge_session = this.find_available_judge_session(player);
        if (judge_session) {
            // TODO
            return;
        }

        this.set_player_state(player, 'DrawState');
    },

    set_player_state: function(player, StateClass) {
        assert(States.hasOwnProperty(StateClass));

        if (player.state) {
            player.state.on_finish(this);
        }

        player.state = new States[StateClass](player);
        player.state.on_start(this);
    },
};

module.exports = GameStateManager;
