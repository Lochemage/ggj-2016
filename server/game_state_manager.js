var Matchmaker = require('./matchmaker');
var GameSession = require('./game_session');
var Player = require('./player');
const assert = require('assert');
var g_image_search = require('./g_image_search');

// var DefaultState = require('./states/default_state');
var States = {
    DrawState: require('./states/draw_state'),
    IdleState: require('./states/idle_state'),
    JudgeState: require('./states/judge_state'),
    SummaryState: require('./states/summary_state'),
};

function GameStateManager() {
    this.game_sessions = [];
    this.players = [];
    this.matchmaker = new Matchmaker();
    this.handlers = {};
    this.externalJudgesNeeded = [];
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

    // find_available_judge_session: function(player) {
    //     var result = null;
    //     var available_judge_session = player.find_available_judge_session();
    //     // console.log('available_judge_session: ' + available_judge_session);
    //     if (available_judge_session.length > 0) {
    //         // console.log('available_judge_session != []')
    //         this.matchmaker.assign_player_to_judge(player, available_judge_session[0], available_judge_session[1]);
    //         player.curr_session = available_judge_session[0];
    //         var data = {};
    //         console.log('calling start judge handler');
    //         this.call_handler('start judge', player, data);
    //         result = available_judge_session[0];
    //     }
    //     return result;
    // },

    update_player_state: function(player) {
        // var judge_session = this.find_available_judge_session(player);
        // if (judge_session) {
        //     // TODO
        //     return;
        // }

        if (player.has_queued_state()) {
            var queue = player.get_queued_state();
            this.set_player_state(player, queue.name, queue.data);
            return;
        }

        // Check if someone needs an external judge.
        for (var i = 0; i < this.externalJudgesNeeded.length; ++i) {
            var game_session = this.externalJudgesNeeded[i].game_session;
            if (!game_session.player_is_in_slot(player)) {
                var slot_idx = this.externalJudgesNeeded[i].slot_idx;
                this.externalJudgesNeeded.splice(i, 1);
                this.addJudgeState(player, game_session, slot_idx);
                return;
            }
        }

        this.set_player_state(player, 'DrawState');
    },

    addJudgeState: function(player, game_session, slot_idx) {
        this.set_player_state(player, 'JudgeState', {game_session: game_session, slot_idx: slot_idx});
    },

    set_player_state: function(player, StateClass, data) {
        console.log('StateClass', StateClass);
        assert(States.hasOwnProperty(StateClass));

        if (player.state) {
            player.state.on_finish(this);
        }

        player.state = new States[StateClass](player);
        player.state.on_start(this, data);
    },

    queue_external_judge: function(game_session, slot_idx) {
        this.externalJudgesNeeded.push({game_session: game_session, slot_idx: slot_idx});
    },
    get_score_list: function() {
        var sorted_list = this.players.slice();
        sorted_list.sort(function(a, b) {
            if(a.points < b.points) return 1;
            if(a.points > b.points) return -1;
            return 0;
        });
        // console.log('sorted_list: ', sorted_list)
        var score_data = [];
        for(var i = 0; i < sorted_list.length; ++i) {
            score_data.push({player: sorted_list[i], score: sorted_list[i].points});
        }
        // console.log('score_data: ', score_data)
        return score_data;
    },
    add_points_to_player: function(points, player) {
        player.addPoints(points);
        this.call_handler('update points', player, player.points);
    }
};

module.exports = GameStateManager;
