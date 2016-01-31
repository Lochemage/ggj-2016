/**********************************************************************
Matchmaker

The matchmaker takes free-floating players and fits them into game
sessions.

//********************************************************************/

// require is like python import
// module is "this file"
// everything blocks, but anything that might take time exits
//   immediately but takes a callback to call when done

var assert = require('assert');

function Matchmaker() {}

Matchmaker.prototype = {
    can_assign_player: function(player, game_session, slotIdx) {
        return game_session.can_place_player_in_slot(player, slotIdx);
        //return !game_session.has_player_in_slot(player);
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
    },
    match_a_player_with_a_session: function(game_session, assignable_player) {
        // naive implementation -- put all assignable players into the game session
        //var next_available_slot;
        //while ((next_available_slot = game_session.get_next_available_slot()) != -1) {
        //    game_session.assign_player_to_slot(assignable_players[players_to_match], i);
        //}
        //
        //var stillAssignablePlayers = [];
        // forPlayers:
        // for (var playerIdx = 0; playerIdx < assignable_players.length; ++playerIdx) {
        // var player = assignable_players[playerIdx];
        var available_slots = game_session.get_available_slots();
        for (var slotIdx = 0; slotIdx < available_slots.length; ++slotIdx) {
            ava_slot = available_slots[slotIdx];
            if (this.can_assign_player(assignable_player, game_session, ava_slot)) {
                var success = game_session.assign_player_to_slot(assignable_player, ava_slot);
                assert(success);
                return true;
                // continue forPlayers;
            }
        }
        // could not find a slot to place this player
        return false;
        //
        //var players_to_match = Math.min(available_slots.length, assignable_players.length);
        //for (var i = players_to_match; i >= 0; i--)
        //{
        //    game_session.assign_player_to_slot(assignable_players[players_to_match], i);
        //}
    },
    match_a_player_with_sessions: function(game_sessions, assignable_player) {
        for (var sessionIdx = 0; sessionIdx < game_sessions.length; ++sessionIdx) {
            game_session = game_sessions[sessionIdx];
            if (this.match_a_player_with_a_session(game_session, assignable_player)) {
                return game_session;
            }
        }
        return null;
    },
    assign_player_to_judge: function(player, judge_session, judge_slot_index) {

    }
};
Matchmaker.prototype.make_me_a_match = Matchmaker.prototype.match_players;  // (:

// entry point
module.exports.init = function() {
    // todo
};
module.exports = Matchmaker;
