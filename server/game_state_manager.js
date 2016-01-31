var Matchmaker = require('./matchmaker');
var GameSession = require('./game_session');
var Player = require('./player');
const assert = require('assert');
var g_image_search = require('./g_image_search');

function GameStateManager() {
    this.game_sessions = [];
    this.players = [];
    this.matchmaker = new Matchmaker();
    this.handlers = {};
};

GameStateManager.prototype = {
    create_new_player: function(user_data) {
        var player = new Player(user_data);
        this.players.push(player);
        return player;
    },
    // might be draw session or judge session
    assign_player_to_game: function(player, callback) {
        var available_judge_session = this.matchmaker.find_available_judge_session(player);
        // console.log('available_judge_session: ' + available_judge_session);
        if(available_judge_session.length > 0) {
            // console.log('available_judge_session != []')
            this.matchmaker.assign_player_to_judge(player, available_judge_session[0], available_judge_session[1]);
            var data = {};
            console.log('calling start judge handler');
            this.call_handler('start judge', data);
            callback(available_judge_session[0]);
        }
        var game_session = this.matchmaker.match_a_player_with_sessions(this.game_sessions, player);
        if (!game_session) {
            var self = this;
            var game_session = this.start_new_game_session(function(game_session){
                var matched = self.matchmaker.match_a_player_with_a_session(game_session, player);
                console.log('matched: ' + matched)
                assert(matched);
                console.log('calling start game handler for new game session');
                self.call_handler('start game', {image: game_session.original_images[0]});
                callback(game_session);
            });
           
        }
        else{
            console.log('calling start game handler for existing game session');
            var player_index = game_session.get_player_slot_index(player);
            console.log('player_index: ', player_index)
            var parent_index = game_session.get_index_of_parent(player_index);
            console.log('parent_index: ', parent_index)
            var parent_image_path = game_session.slots[parent_index].image_path;
            assert(parent_image_path != '');
            this.call_handler('start game', {image: parent_image_path});
            callback(game_session);
        }
    },

    // start_new_game_session: g_image_search.init(4).then(function (image_url){
    //     console.log('image url: ' + image_url)
    //     }
    // ),
    start_new_game_session: function(callback) {
        var self = this;
        g_image_search.init(4).then(function (image_urls) {
            var game_session = new GameSession(image_urls);
            self.game_sessions.push(game_session);
            callback(game_session);
        });
        
    },
    player_submit_image: function(player, image_path, game_session) {
        var player_index = game_session.get_player_slot_index(player);
        game_session.save_image_to_slot(player_index, image_path);

        //check if this player is last grand child
        var grand_index = game_session.get_index_of_grandparent(player_index);
        var last_child_index = game_session.get_index_of_first_grandchild(grand_index) + 3;
        if(player_index == last_child_index) {
            // notify grandparent
            grandparent_player = game_session.slots[grand_index].player;
            grandparent_player.event_queue.push({event_type: 'judge', game_session: game_session, judge_index: grand_index});
        }
        if(player_index != 0) {
            player.event_queue.splice(0, 0, {});
        }
    },
    add_handler: function(type, callback) {
        if (!this.handlers.hasOwnProperty(type)) {
            this.handlers[type] = [];
        }

        this.handlers[type].push(callback);
    },
    call_handler: function(type, data) {
        if(this.handlers.hasOwnProperty(type)) {
            for (var i = 0; i < this.handlers[type].length; ++i) {
                this.handlers[type][i](data);
            }
        }
    },
};
// // entry point
// module.exports.init = function() {
//     // todo
// };
// module.exports.game_state_manager = new GameStateManager();
module.exports = GameStateManager;

