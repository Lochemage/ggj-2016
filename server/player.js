/**********************************************************************
Player

The state of a player playing the game.

//********************************************************************/

function Player(data) {
    this.name = data.name;
    this.user = data.user;
    this.state_queue = [];
    this.curr_session = null;
    this.state = null;
    this.is_dead = false;
    this.points = 0;
};

Player.prototype = {
    has_queued_state: function() {
        return this.state_queue.length > 0;
    },
    get_queued_state: function() {
        return this.state_queue.unshift();
    },
    // find_available_judge_session: function() {
    //     for (var event_index = 0; event_index < this.state_queue.length; ++event_index) {
    //         var curr_event = this.state_queue[event_index];
    //         if (curr_event.event_type.indexOf('judge') > -1) {
    //             var judge_game_session = curr_event.game_session;
    //             var judge_slot_index = curr_event.judge_index;
    //             return [judge_game_session, judge_slot_index];
    //         }
    //     }
    //     return [];
    // },
    disconnect: function(gsm) {
        if (this.state) {
            this.state.on_event(gsm, {name: 'disconnect'});
            this.is_dead = true;
        }
    },
    die: function() { this.is_dead = true; },
    isDead: function() { return this.is_dead; },
    isAlive: function() { return !this.isDead(); },
    addPoints: function(numPoints) { this.points += numPoints; }
};

module.exports = Player;
