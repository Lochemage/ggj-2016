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
    player_is_in_slot: function(player, slot_idx) {
        return this.slots[slot_idx] !== undefined && this.slots[slot_idx].player == player;
    },
    assign_player_to_slot: function(player, slot_idx) {
        if (slot_idx in this.slots && slot_idx in this.get_available_slots()) {
            this.slots[slot_idx] = { player: player };
            // remove available_slot at idx
            this.available_slots.splice(this.available_slots.indexOf(slot_idx), 1);
        }
        return this.player_is_in_slot(player, slot_idx);
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
    get_index_of_grandparent: function(slotIdx) {
        parent_index = this.get_index_of_parent(slotIdx);
        return this.get_index_of_parent(parent_index);
    },
    get_index_of_first_grandchild: function(slotIdx) {
        child_index = this.get_index_of_first_child(slotIdx);
        return this.get_index_of_first_child(child_index);
    },
    has_player_in_slot: function(player) {
        for (var slotIdx = 0; slotIdx < this.slots.length; ++slotIdx) {
            if (this.slots[slotIdx] && this.slots[slotIdx].player == player) {
                return true;
            }
        }
        return false;
    },
    get_player_slot_index: function(player) {
        for (var slotIdx = 0; slotIdx < this.slots.length; ++slotIdx) {
            if (this.slots[slotIdx] && this.slots[slotIdx].player == player) {
                return slotIdx;
            }
        }
        return -1;
    },
    save_image_to_slot: function(slot_idx, image_path) {
        this.slots[sloat_index][image_path] = image_path
    }
};

module.exports = GameSession;
