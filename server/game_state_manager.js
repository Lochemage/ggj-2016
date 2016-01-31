var Matchmaker = require('./matchmaker');
var GameSession = require('./game_session');
var Player = require('./player');
const assert = require('assert');
var g_image_search = require('./g_image_search');

function GameStateManager() {
    this.game_sessions = [];
    this.players = [];
    this.matchmaker = new Matchmaker();
};

GameStateManager.prototype = {
    create_new_player: function(user_data) {
        var player = new Player(user_data);
        this.players.push(player);
        return player;
    },
    assign_player_to_game: function(player, callback) {
        var game_session = this.matchmaker.match_a_player_with_sessions(this.game_sessions, player);
        if (!game_session) {
            var self = this;
            var game_session = this.start_new_game_session(function(game_session){
                var matched = self.matchmaker.match_a_player_with_a_session(game_session, player);
                assert(matched);
                callback(game_session);
            });
           
        }
        else{
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