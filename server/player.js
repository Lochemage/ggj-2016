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
        return this.state_queue.shift();
    },
    queue_state: function(data) {
        if (this.isAlive()) {
            this.state_queue.push(data);
        }
    },
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
