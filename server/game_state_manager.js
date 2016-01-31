var matchmaker = require('./matchmaker');
var game_session = require('./game_session');

function GameStateManager() {
    this.game_sessions = [undefined];
    this.players = [undefined];
    matchmaker.init();
};

GameStateManager.prototype = {
    register_new_player: function(player) {
        this.players.push(player);
    },
    start_new_game_session: function() {
        // probably wrong
        game_session = game_session.init();
        this.game_sessions.push(game_session);
        return game_session;
    },
    player_submit_image: function(player, image_path, game_session) {
        player_index = game_session.get_player_slot_index(player);
        game_session.save_image_to_slot(player_index, image_path);

        //check if this player is last grand child
        grand_index = game_session.get_index_of_grandparent(player_index);
        last_child_index = game_session.get_index_of_first_grandchild(grand_index) + 3;
        if(player_index == last_child_index) {
            // notify grandparent
            // grandparent_player = game_session.
        }
    },
};
// entry point
module.exports.init = function() {
    // todo
};
module.exports.game_state_manager = new GameStateManager();