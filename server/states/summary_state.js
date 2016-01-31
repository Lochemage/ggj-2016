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
        switch (event.name) {
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
            summary_data.push({player: curr_slot_data.player.name, image: curr_slot_data.image_path});
        }
        gsm.call_handler('start summary', this.player, summary_data);
    },
    on_finish: function(gsm) {
    }
};

///////////////////////////////////////////////////////////////////////

module.exports = SummaryState;
