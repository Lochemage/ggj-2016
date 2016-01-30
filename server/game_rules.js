/**********************************************************************
Game Rules

The rules of the game.

//********************************************************************/

const util = require('util');

///////////////////////////////////////////////////////////////////////

function GamePhase() {};

///////////////////////////////////////////////////////////////////////

function DrawPhase() {
    GamePhase.call(this);
};
util.inherits(DrawPhase, GamePhase);

///////////////////////////////////////////////////////////////////////

// jlu is working on this
function JudgePhase() {
    JudgePhase.call(this);
};
util.inherits(JudgePhase, GamePhase);

///////////////////////////////////////////////////////////////////////

function GameRules() {
    this.phases = [new DrawPhase(), new JudgePhase()];
};

GameRules.prototype = {};

module.exports.game_rules = GameRules;
