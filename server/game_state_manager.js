var matchmaker = require('./matchmaker');

function GameStateManager() {
    this.game_sessions = [undefined];
    this.players = [undefined];

};

// entry point
module.exports.init = function() {
    // todo
};
module.exports.game_state_manager = new GameStateManager();