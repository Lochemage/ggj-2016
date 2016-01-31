/**********************************************************************
Player

The state of a player playing the game.

//********************************************************************/

function Player(name) {
    this.name = name;
    this.user = null;
    this.event_queue = [];
};

Player.prototype = {
};

module.exports = Player;
