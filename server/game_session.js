/**********************************************************************
Game Session

The game session has slots for players and steps through the phases of
a game.

//********************************************************************/

function GameSession() {
    this.slots = [null];
    this.available_slots = [1];
};

GameSession.prototype = {
    get_available_slots: function() {
        return this.available_slots;
    },
    assign_player_to_slot: function(player, slot_idx) {
        this.slots[slot_idx] = player;
        // remove available_slot at idx
        this.available_slots.splice(available_slots.indexOf(slot_idx), 1);
        return 0;
    }
};

module.exports.game_session = new GameSession();

module.exports.init = function() {
    // todo
};
