var matchmaker = require('../matchmaker');
var GameSession = require('../game_session');
var Player = require('../player');

describe('matchmaker', function() {
    var game_session = new GameSession();
    var assignable_players = [new Player('tom'), new Player('dick'), new Player('harry')]
    before('initialization', function() {
        // add code if needed
    });
    it('make me a match', function(done) {
        stillUnassignable = matchmaker.matchmaker.make_me_a_match(game_session, assignable_players)
        done();
        // done(new Error('nope!'));
    });
});
