/**********************************************************************
Player

The state of a player playing the game.

//********************************************************************/

function Player(data) {
    this.name = data.name;
    this.user = data.user;
    this.event_queue = [];
    this.curr_session = null;
};

Player.prototype = {
};

module.exports = Player;
