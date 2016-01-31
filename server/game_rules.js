/**********************************************************************
Game Rules

The rules of the game.

//********************************************************************/

const util = require('util');

///////////////////////////////////////////////////////////////////////

function GamePhase() {
};

GamePhase.prototype = {
    // todo
};

///////////////////////////////////////////////////////////////////////

function DrawPhase() {
    GamePhase.call(this);
};
util.inherits(DrawPhase, GamePhase);

///////////////////////////////////////////////////////////////////////

function JudgePhase() {
    JudgePhase.call(this);
};
util.inherits(JudgePhase, GamePhase);
JudgePhase.prototype = {
    // todo
};

///////////////////////////////////////////////////////////////////////

function GameRules() {
    this.phases = [new DrawPhase(), new JudgePhase()];
};

GameRules.prototype = {};

module.exports.game_rules = GameRules;
