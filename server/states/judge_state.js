/**********************************************************************
Judge State

Allows one player to judge drawings made by others.

//********************************************************************/

const assert = require('assert');

////////////////////////////////////////////////////////////////////////

var selectedImage = -1;
var specialImages = { // negate and subtract one to index into GameSession.original_images
    SELECTED_SRC_IMAGE: -1,
    AUX_SRC_IMAGE_1: -2,
    AUX_SRC_IMAGE_2: -3,
    AUX_SRC_IMAGE_3: -4
};

function mapJudgeToJudged(judgeIdx) {
    var prompt = 0;
    judgedIdxes = [];
    switch (judgeIdx) {
        case 0:
            prompt = specialImages.SELECTED_SRC_IMAGE;
            judgedIdxes = [3, 4, 5, 6];
            break;
        default:
            prompt = judgeIdx;
            judgedIdxes = [-1, -2, -3, -4];
            break;
    }
    return {
        prompt: prompt,
        judged: judgedIdxes
    };
};

function getImageFromSlotIdx(gameSession, slotIdx) {
    return slotIdx < 0
        ? gameSession.original_images[slotIdx*-1 -1]
        : gameSession.get_image_from_slot(slotIdx);
}

function shuffle(o){
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}

function getJudgeImageSet(gameSession, judgeIdx) {
    var imagesToJudge = [];
    var judgeThese = mapJudgeToJudged(judgeIdx);
    for (var i = 0; i < judgeThese.judged.length; ++i) {
        imagesToJudge.push(getImageFromSlotIdx(gameSession, judgeThese.judged[i]));
    }
    return {
        source: getImageFromSlotIdx(gameSession, judgeThese.prompt),
        choices: shuffle(imagesToJudge)
    };
}

////////////////////////////////////////////////////////////////////////

function JudgeState(player) {
    this.player = player;
};

JudgeState.prototype = {
    on_event: function(gsm, event) {
        switch (event.name) {
            case 'decided':
                switch (event.slot_idx) {
                    //
                }
                break;
            // case 'submit drawing':
            //     var game_session = this.player.curr_session;
            //     var player_index = game_session.get_player_slot_index(this.player);
            //     game_session.save_image_to_slot(player_index, event.image_path);

            //     if (game_session.is_finished()) {
            //         // for (var slotIdx = 3; slotIdx < 7; ++slotIdx) {
            //         //     game_session.slots[slotIdx].player.state_queue.push({
            //         //         event_type: 'judge grandparent',
            //         //         game_session: game_session,
            //         //         judge_index: slotIdx
            //         //     });
            //         // }
            //         game_session.slots[0].player.state_queue.push({
            //             name: 'JudgeState',
            //             data: {
            //                 game_session: game_session
            //             }
            //         });
            //         // TODO: Find some way to queue an outside player to for judging.
            //     }
            //     this.player.curr_session = null;
            //     gsm.set_player_state(this.player, 'IdleState');
            //     break;

            default:
                break;
        }
    },
    on_start: function(gsm, data) {
        var game_session = data.game_session;
        var slot_idx = data.slot_idx;
        

        gsm.call_handler('start judging', this.player, {image: parent_image_path});
    },
    on_finish: function(gsm) {
    }
};

///////////////////////////////////////////////////////////////////////

module.exports = JudgeState;
