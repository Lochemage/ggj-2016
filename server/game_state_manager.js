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
    clean_game_sessions: function() {
        console.log('running cleanup');
        for (var i = 0; i < this.game_sessions.length; ++i) {
            var game_session = this.game_sessions[i];

            // A finished session may be ready for cleanup if there are no
            // outstanding judgments or summaries to be made. 
            if (game_session.is_finished()) {
                console.log('session is finished, checking for cleanup...');
                if (!game_session.has_originator_judged) {
                    var player = game_session.slots[0].player;
                    if (!player || player.isDead() || !player.has_queued_state('JudgeState')) {
                        // For whatever reason, our player is gone or is
                        // not participating in the judging, outsource it instead.

                        if (!game_session.first_judger || !game_session.first_judger.state || game_session.first_judger.state.name !== 'JudgeState') {
                            console.log('outsourcing a new primary judge');
                            this.queue_external_judge(game_session, 0);
                        }
                    }
                    continue;
                }

                if (!game_session.has_outsider_judged) {
                    if (game_session.judge_picked) {
                        // First make sure we are not in the middle of judging already.
                        if (!game_session.last_judger || !game_session.last_judger.state || game_session.last_judger.state.name !== 'JudgeState') {
                            // In this case, the judge for this slot is always outsourced, so make
                            // sure we have a judge queued.
                            if (!this.has_queued_external_judge(game_session)) {
                                // For whatever reason, an external judge was never requested.
                                console.log('outsourcing a new outsider judge');
                                this.queue_external_judge(game_session, game_session.judge_picked);
                            }
                        }
                    }
                    continue;
                }

                for (var slotIdx = 0; slotIdx < 7; ++slotIdx) {
                    // Players who have yet to view this session's summary need to be invited.
                    if (!game_session.slots[slotIdx].summary_viewed) {
                        var player = game_session.slots[slotIdx].player;
                        if (!player || player.isDead() || !player.has_queued_state('SummaryState')) {
                            // If our player is gone, we don't need to bother showing them the summary view.
                            game_session.slots[slotIdx].summary_viewed = true;
                        }
                    }
                    continue;
                }

                // If we reach this point, there is nothing left to do, we can scrap this session.
                this.game_sessions.splice(i, 1);
                i--;
            }
        }

        // Notify all about the session count.
        this.call_handler('debug session count', null, this.game_sessions.length);
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

    create_new_player: function(user_data) {
        var player = new Player(user_data);
        // console.log('create player', player);
        this.players.push(player);
        // console.log('this.players: ', this.players);
        return player;
    },

    start_new_game_session: function() {
        var image_urls = g_image_search.provideImages(4);
        var game_session = new GameSession(image_urls);
        this.game_sessions.push(game_session);

        console.log('creating session');
        this.call_handler('debug session count', null, this.game_sessions.length);

        return game_session;
    },

    update_player_state: function(player) {
        // Process any queued states applied for this player.
        if (player.has_queued_state()) {
            var queue = player.get_queued_state();
            this.set_player_state(player, queue.name, queue.data);
            return;
        }

        // Check if someone needs an external judge.
        for (var i = 0; i < this.externalJudgesNeeded.length; ++i) {
            var game_session = this.externalJudgesNeeded[i].game_session;
            if (!game_session.has_player_in_slot(player) && !game_session.has_player_been_judger(player)) {
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
        // this.update_score_board(player);
    },

    queue_external_judge: function(game_session, slot_idx) {
        if (!game_session || slot_idx < 0) {
            return;
        }
        this.externalJudgesNeeded.push({game_session: game_session, slot_idx: slot_idx});
    },

    has_queued_external_judge: function(game_session) {
        for (var i = 0; i < this.externalJudgesNeeded.length; ++i) {
            if (this.externalJudgesNeeded[i].game_session === game_session) {
                return true;
            }
        }
        return false;
    },

    ///////////////////////////////////////////////////////////////////

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
            score_data.push({player: sorted_list[i].name, score: sorted_list[i].points});
        }
        // console.log('score_data: ', score_data)
        return score_data;
    },

    add_points_to_player: function(points, player) {
        player.addPoints(points);
        this.call_handler('update points', player, {myPoints: player.points, allPoints: this.get_score_list()});
    },

    update_score_board: function(player) {
        this.call_handler('update points', player, {myPoints: null, allPoints: this.get_score_list()});
    },

    remove_player_connection: function(player) {
        var index = this.players.indexOf(player);
        if (index > -1) {
            this.players.splice(index, 1);
        }
    }
};

module.exports = GameStateManager;
