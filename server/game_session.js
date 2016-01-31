/**********************************************************************
Game Session

The game session has slots for players and steps through the phases of
a game.

//********************************************************************/

function GameSession(original_images) {
    this.slots = [undefined];
    this.available_slots = [0];
    // let's just always use this.original_images[0] as the real original image
    this.original_images = original_images;
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
    player_is_in_slot: function(player, slotIdx) {
        return !!(this.slots[slotIdx] && this.slots[slotIdx].player == player);
    },
    assign_player_to_slot: function(player, slotIdx) {
        //if (slotIdx in this.slots && slotIdx in this.get_available_slots()) {
        if (this.can_place_player_in_slot(player, slotIdx)) {
        //if (this.slots.length > slotIdx && slotIdx >= 0 && this.get_available_slots().indexOf(slotIdx) > -1) {
            this.slots[slotIdx] = { player: player };
            // remove available_slot at idx
            this.available_slots.splice(this.available_slots.indexOf(slotIdx), 1);
        }
        return this.player_is_in_slot(player, slotIdx);
    },
    remove_player_from_slot: function(player, slotIdx) {
        this.slots[slotIdx] = null;
        for (var newHomeIdx = 0;
            newHomeIdx < this.available_slots.length && this.available_slots[newHomeIdx] <  slotIdx;
            ++newHomeIdx) {
        }
        this.available_slots.splice(newHomeIdx, 0, slotIdx);
    },
    // expand: function(num_new_slots) {
    //     for (var i = 0; i < num_new_slots; i++) {
    //         this.available_slots.push(this.slots.length + i);
    //     }
    //     this.slots.length += num_new_slots;
    // },
    // expand_row: function() {
    //     this.expand(this.slots.length);
    // },
    expand_children: function(slotIdx) {
        var first_child_index = this.get_index_of_first_child(slotIdx);
        this.available_slots.push(first_child_index);
        // console.log('this.slots: ' + this.slots)
        // console.log('this.slots[first_child_index]: ' + this.slots[first_child_index])
        this.slots[first_child_index] = {};
        this.slots[first_child_index] = null;
        this.available_slots.push(first_child_index + 1);
        this.slots[first_child_index + 1] = {};
        this.slots[first_child_index + 1] = null;
    },
    get_index_of_parent: function(slotIdx) {
        return slotIdx > -1 ? Math.ceil(slotIdx/2) - 1 : -1;
    },
    get_index_of_first_child: function(slotIdx) {
        return slotIdx > -1 ? slotIdx*2 + 1 : -1;
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
    can_place_player_in_slot: function(player, slotIdx) {
        //return !this.has_player_in_slot(player) && (slotIdx in this.get_available_slots());
        //return !this.has_player_in_slot(player) && this.get_available_slots().indexOf(slotIdx) > -1;
        return !this.has_player_in_slot(player) && this.get_available_slots().indexOf(slotIdx) > -1;
    },
    get_player_slot_index: function(player) {
        for (var slotIdx = 0; slotIdx < this.slots.length; ++slotIdx) {
            if (this.slots[slotIdx] && this.slots[slotIdx].player == player) {
                return slotIdx;
            }
        }
        return -1;
    },
    save_image_to_slot: function(slotIdx, image_path) {
        this.slots[slotIdx].image_path = image_path;
        // console.log('this.slots', this.slots);
        if (!this.can_expand()) {
            this.expand_children(slotIdx);
        }
    },
    get_image_from_slot: function(slotIdx) {
        return slotIdx < 0 || slotIdx > this.slots.length
            ? ''
            : this.slots[slotIdx].image_path;
    },
    find_slot_with_image: function(image_path) {
        for (var slotIdx = 0; slotIdx < this.slots.length; ++slotIdx) {
            if (this.slots[slotIdx].image_path == image_path) {
                return slotIdx;
            }
        }
        return -1;
    },
    is_finished: function() {
        // check that all slots on the third row of this game session are done
        for (var slotIdx = 0; slotIdx < 7; ++slotIdx) {
            if (!this.slots[slotIdx] || !this.slots[slotIdx].image_path) {
                return false;
            }
        }
        return true;
    },
    can_expand: function() {
        return this.slots.length >= 7;
    },
    get_player_parent_image: function(player) {
        console.log('*** get_player_parent_image ***');
        var playerIdx = this.get_player_slot_index(player);
        console.log('playerIdx', playerIdx);
        var parentIdx = this.get_index_of_parent(playerIdx);
        console.log('parentIdx', parentIdx);
        return parentIdx > -1 && parentIdx < this.slots.length
            ? this.slots[parentIdx].image_path
            : this.original_images[0];
    }
};

module.exports = GameSession;
