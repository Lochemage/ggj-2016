var Matchmaker = require('./matchmaker');
var GameSession = require('./game_session');
var Player = require('./player');
const assert = require('assert');

function GameStateManager() {
    this.game_sessions = [];
    this.players = [];
    this.matchmaker = new Matchmaker();
};

GameStateManager.prototype = {
    create_new_player: function(user_data) {
        var player = new Player(user_data);
        this.players.push(player);
        var matched = this.matchmaker.match_a_player_with_sessions(this.game_sessions, player);
        if (!matched) {
            var game_session = this.start_new_game_session();
            matched = this.matchmaker.match_a_player_with_a_session(game_session, player);
            assert(matched);
        }
        return player;
    },
    start_new_game_session: function() {
        
        var game_session = new GameSession();
        this.game_sessions.push(game_session);
        return game_session;
    },
    player_submit_image: function(player, image_path, game_session) {
        var player_index = game_session.get_player_slot_index(player);
        game_session.save_image_to_slot(player_index, image_path);

        //check if this player is last grand child
        var grand_index = game_session.get_index_of_grandparent(player_index);
        var last_child_index = game_session.get_index_of_first_grandchild(grand_index) + 3;
        if(player_index == last_child_index) {
            // notify grandparent
            // grandparent_player = game_session.
        }
    },
};
// // entry point
// module.exports.init = function() {
//     // todo
// };
// module.exports.game_state_manager = new GameStateManager();
module.exports = GameStateManager;