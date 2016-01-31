/**********************************************************************
Player

The state of a player playing the game.

//********************************************************************/

function Player(data) {
    this.name = data.name;
    this.user = data.user;
    this.event_queue = [];
};

Player.prototype = {
};

module.exports = Player;
