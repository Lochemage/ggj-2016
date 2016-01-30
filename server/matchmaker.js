/**********************************************************************
Matchmaker

The matchmaker takes free-floating players and fits them into game
sessions.

//********************************************************************/

var game_session = require('./game_session');

// require is like python import
// module is "this file"
// everything blocks, but anything that might take time exits
//   immediately but takes a callback to call when done

function Matchmaker() {}

Matchmaker.prototype = {
    match_players: function(game_session, assignable_players) {
        // naive implementation -- put all assignable players into the game session
        var available_slots = game_session.get_available_slots();
        var players_to_match = Math.min(available_slots.length, assignable_players.length);
        for (var i = players_to_match; i >= 0; i--)
        {
            game_session.assign_player_to_slot(assignable_players[players_to_match], i);
        }
    }
};
Matchmaker.prototype.make_me_a_match = Matchmaker.prototype.match_players;  // (:

// entry point
module.exports.init = function() {
    // todo
};
module.exports.matchmaker = new Matchmaker();
