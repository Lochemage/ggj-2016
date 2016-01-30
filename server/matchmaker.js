/**********************************************************************
Matchmaker

The matchmaker takes free-floating players and fits them into game
sessions.

//********************************************************************/

// require is like python import
// module is "this file"
// everything blocks, but anything that might take time exits
//   immediately but takes a callback to call when done

function Matchmaker() {}

Matchmaker.prototype = {
    can_assign_player: function(player, game_session, slotIdx) {
        return !game_session.has_player_in_slot(player);
    },
    match_players: function(game_session, assignable_players) {
        // naive implementation -- put all assignable players into the game session
        //var next_available_slot;
        //while ((next_available_slot = game_session.get_next_available_slot()) != -1) {
        //    game_session.assign_player_to_slot(assignable_players[players_to_match], i);
        //}
        //
        var available_slots = game_session.get_available_slots();
        //
        var stillAssignablePlayers = [];
        forPlayers:
        for (var playerIdx = 0; playerIdx < assignable_players.length; ++playerIdx) {
            var player = assignable_players[playerIdx];
            var available_slots = game_session.get_available_slots();
            for (var slotIdx = 0; slotIdx < available_slots.length; ++slotIdx) {
                if (this.can_assign_player(player, game_session, slotIdx)) {
                    game_session.assign_player_to_slot(player, slotIdx);
                    continue forPlayers;
                }
            }
            // could not find a slot to place this player
            stillAssignablePlayers.push(player);
        }
        return stillAssignablePlayers;
        //
        //var players_to_match = Math.min(available_slots.length, assignable_players.length);
        //for (var i = players_to_match; i >= 0; i--)
        //{
        //    game_session.assign_player_to_slot(assignable_players[players_to_match], i);
        //}
    }
};
Matchmaker.prototype.make_me_a_match = Matchmaker.prototype.match_players;  // (:

// entry point
module.exports.init = function() {
    // todo
};
module.exports.matchmaker = new Matchmaker();
