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
    has_queued_state: function(name) {
        if (name) {
            for (var i = 0; i < this.state_queue.length; ++i) {
                if (this.state_queue[i].name === name) {
                    return true;
                }
            }
        }

        return this.state_queue.length > 0;
    },
    get_queued_state: function() {
        return this.state_queue.shift();
    },
    queue_state: function(data) {
        this.state_queue.push(data);
    },
    disconnect: function(gsm) {
        if (this.state) {
            this.state.on_event(gsm, {name: 'disconnect'});
            this.state.on_finish();
            this.state = null;
        }

        // drop references.
        if (this.user) {
            this.user.player = null;
            this.user = null;
        }
        this.curr_session = null;
        this.die();
    },
    die: function() { this.is_dead = true; },
    isDead: function() { return this.is_dead; },
    isAlive: function() { return !this.isDead(); },
    addPoints: function(numPoints) { this.points += numPoints; }
};

module.exports = Player;
