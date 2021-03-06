/**********************************************************************
Default State

A stand-in state to apply for states that don't need specialized logic.

//********************************************************************/

const assert = require('assert');

function DrawState(player) {
    this.name = 'DrawState';
    this.player = player;
};

DrawState.prototype = {
    on_event: function(gsm, event) {
        var game_session = this.player.curr_session;
        var player_index = game_session.get_player_slot_index(this.player);
        switch (event.name) {
            case 'submit drawing':
                game_session.save_image_to_slot(player_index, event.image_path);

                if (game_session.is_finished()) {
                    // The original player should now make their judgement.
                    game_session.slots[0].player.queue_state({
                        name: 'JudgeState',
                        data: {
                            game_session: game_session,
                            slot_idx: 0
                        }
                    });
                }
                this.player.curr_session = null;
                gsm.add_points_to_player(1, this.player);
                gsm.set_player_state(this.player, 'IdleState');
                break;

            case 'disconnect':
                game_session.remove_player_from_slot(this.player, player_index);
                break;
            default:
                break;
        }
    },
    on_start: function(gsm) {
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
    },
    on_finish: function(gsm) {
    }
};

///////////////////////////////////////////////////////////////////////

module.exports = DrawState;
