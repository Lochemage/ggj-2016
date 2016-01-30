/**********************************************************************
Game Session

The game session has slots for players and steps through the phases of
a game.

//********************************************************************/

function GameSession() {
    this.slots = [undefined];
    this.available_slots = [0];
};

GameSession.prototype = {
    get_available_slots: function() {
        return this.available_slots;
    },
    get_next_available_slot: function() {
        return this.available_slots.length > 0 ? this.available_slots[0] : -1;
        //for (var i = 0; i < this.slots.length; ++i) {
        //    if (!this.slots[i]) {
        //        return i;
        //    }
        //}
        //return -1;
    },
    assign_player_to_slot: function(player, slot_idx) {
        this.slots[slot_idx] = { player: player };
        // remove available_slot at idx
        this.available_slots.splice(this.available_slots.indexOf(slot_idx), 1);
        return 0;
    },
    expand: function(num_new_slots) {
        for (var i = 0; i < num_new_slots; i++) {
            this.available_slots.push(this.slots.length + i);
        }
        this.slots.length += num_new_slots;
    },
    expand_row: function() {
        this.expand(this.slots.length);
    },
    get_index_of_parent: function(slotIdx) {
        return Math.ceil(slotIdx/2) - 1;
    },
    get_index_of_first_child: function(slotIdx) {
        return slotIdx*2 + 1;
    },
    has_player_in_slot: function(player) {
        for (var slotIdx = 0; slotIdx < this.slots.length; ++slotIdx) {
            if (this.slots[slotIdx] && this.slots[slotIdx].player == player) {
                return true;
            }
        }
        return false;
    }
};

module.exports = GameSession;
