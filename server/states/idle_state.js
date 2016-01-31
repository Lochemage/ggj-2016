/**********************************************************************
Default State

A stand-in state to apply for states that don't need specialized logic.

//********************************************************************/

const assert = require('assert');

function DrawState(player) {
    this.player = player;
};

DrawState.prototype = {
    on_event: function(gsm, event) {
        switch (event.name) {
            case 'play again':
                gsm.update_player_state(this.player);
                break;

            default:
                break;
        }
    },
    on_start: function(gsm) {
    },
    on_finish: function(gsm) {
    }
};

///////////////////////////////////////////////////////////////////////

module.exports = DrawState;
