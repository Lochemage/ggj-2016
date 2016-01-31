/**********************************************************************
Default State

A stand-in state to apply for states that don't need specialized logic.

//********************************************************************/

const assert = require('assert');

function DrawState(player/*imageUrl*/) {
    this.player = player;
    //image: imageUrl
};

DrawState.prototype = {
    on_start: function(gsm, callback) {
        var game_session = gsm.matchmaker.match_a_player_with_sessions(gsm.game_sessions, this.player);
        if (!game_session) {
            console.log('creating a new game session');
            var game_session = gsm.start_new_game_session();
            var matched = gsm.matchmaker.match_a_player_with_a_session(game_session, this.player);
            assert(matched);
        }
        var parent_image_path = game_session.get_player_parent_image(this.player);
        assert(parent_image_path != '');
        this.player.curr_session = game_session;
        console.log('calling start game handler for game session');
        gsm.call_handler('start game', this.player, {image: parent_image_path});
        callback(game_session);
    },
    on_finish: function(eventData) {
        var player = this.player;
        var image_path = eventData.image_path;
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

///////////////////////////////////////////////////////////////////////

module.exports = DrawState;
