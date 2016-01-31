/**********************************************************************
Judge State

Allows one player to judge drawings made by others.

//********************************************************************/

const assert = require('assert');

function JudgeState(player) {
    this.player = player;
};

JudgeState.prototype = {
    on_event: function(gsm, event) {
        switch (event.name) {
            // case 'submit drawing':
            //     var game_session = this.player.curr_session;
            //     var player_index = game_session.get_player_slot_index(this.player);
            //     game_session.save_image_to_slot(player_index, event.image_path);

            //     if (game_session.is_finished()) {
            //         // for (var slotIdx = 3; slotIdx < 7; ++slotIdx) {
            //         //     game_session.slots[slotIdx].player.state_queue.push({
            //         //         event_type: 'judge grandparent',
            //         //         game_session: game_session,
            //         //         judge_index: slotIdx
            //         //     });
            //         // }
            //         game_session.slots[0].player.state_queue.push({
            //             name: 'JudgeState',
            //             data: {
            //                 game_session: game_session
            //             }
            //         });
            //         // TODO: Find some way to queue an outside player to for judging.
            //     }
            //     this.player.curr_session = null;
            //     gsm.set_player_state(this.player, 'IdleState');
            //     break;

            default:
                break;
        }
    },
    on_start: function(gsm, data) {
        var game_session = data.game_session;
        var slot_idx = data.slot_idx;
        

        gsm.call_handler('start judging', this.player, {image: parent_image_path});
    },
    on_finish: function(gsm) {
    }
};

///////////////////////////////////////////////////////////////////////

module.exports = JudgeState;
