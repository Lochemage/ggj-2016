/**********************************************************************
Default State

A stand-in state to apply for states that don't need specialized logic.

//********************************************************************/

const assert = require('assert');

function SummaryState(player) {
    this.player = player;
};

SummaryState.prototype = {
    on_event: function(gsm, event) {
        var game_session = this.player.curr_session;
        var player_index = game_session.get_player_slot_index(this.player);
        switch (event.name) {
            // case 'submit drawing':
            //     game_session.save_image_to_slot(player_index, event.image_path);

            //     if (game_session.is_finished()) {
            //         // for (var slotIdx = 3; slotIdx < 7; ++slotIdx) {
            //         //     game_session.slots[slotIdx].player.state_queue.push({
            //         //         event_type: 'judge grandparent',
            //         //         game_session: game_session,
            //         //         judge_index: slotIdx
            //         //     });
            //         // }

            //         // The original player should now make their judgement.
            //         game_session.slots[0].player.state_queue.push({
            //             name: 'JudgeState',
            //             data: {
            //                 game_session: game_session,
            //                 slot_idx: 0
            //             }
            //         });
            //         // TODO: Find some way to queue an outside player to for judging.
            //         // gsm.queue_external_judge(game_session);
            //     }
            //     this.player.curr_session = null;
            //     gsm.set_player_state(this.player, 'IdleState');
            //     break;

            // case 'disconnect':
            //     game_session.remove_player_from_slot(this.player, player_index);
            //     break;
            default:
                break;
        }
    },
    on_start: function(gsm, event_data) {
        var game_session = event_data.game_session;
        var summary_data = []
        summary_data.push({player: 'original', image: game_session.original_images[0]})
        for(var i = 0; i < game_session.slots.length; ++i) {
            curr_slot_data = game_session.slots[i];
            summary_data.push({player: curr_slot_data.player, image: curr_slot_data.image_path});
        }
        gsm.call_handler('start summary', this.player, summary_data);
    },
    on_finish: function(gsm) {
    }
};

///////////////////////////////////////////////////////////////////////

module.exports = SummaryState;
