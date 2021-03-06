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

// shuffle algorithm taken from: http://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array-in-javascript/6274381#6274381
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

// returns a list of new events sessions to queue
function onJudgment(gsm, player, gameSession, source, pickedURL) {
    var queue = [];
    var srcIdx = gameSession.original_images.indexOf(pickedURL);
    if (srcIdx < 0) {
        // on the board
        // we're the grandparent judging our grandchildren
        // find the picked grandchild and parent slot index
        var grandchildIdx = gameSession.find_slot_with_image(pickedURL);
        var parentIdx = gameSession.get_index_of_parent(grandchildIdx);
        var rootIdx = gameSession.get_index_of_parent(parentIdx);
        // need to assign points to winners (selected grandchild and their parent)
        if (gameSession.slots[grandchildIdx]) {
            gsm.add_points_to_player(20, gameSession.slots[grandchildIdx].player);
        }
        if (gameSession.slots[parentIdx]) {
            gsm.add_points_to_player(20, gameSession.slots[parentIdx].player);
        }
        // queue up a judge session for grandchild's picture
        queue.push({
            game_session: gameSession,
            slot_idx: grandchildIdx
        });
        gameSession.judge_picked = grandchildIdx;
        gameSession.has_originator_judged = true;

        gsm.set_player_state(player, 'SummaryState', {game_session: gameSession, slot_idx: -1, selected: [grandchildIdx, parentIdx, rootIdx]});
    }
    else {
        // off the board (source image)
        // we're judging grandchild against the four source images
        // we need to decide if we chose the correct one -- if so, award points to the grandchild and ancestors
        var correctChoice = (srcIdx == 0);
        var grandchildIdx = gameSession.find_slot_with_image(source);
        var parentIdx = gameSession.get_index_of_parent(grandchildIdx);
        var rootIdx = gameSession.get_index_of_parent(parentIdx);

        if (correctChoice) {
            if (gameSession.slots[grandchildIdx]) {
                gsm.add_points_to_player(20, gameSession.slots[grandchildIdx].player);
            }
            if (gameSession.slots[parentIdx]) {
                gsm.add_points_to_player(20, gameSession.slots[parentIdx].player);
            }
            if (gameSession.slots[rootIdx]) {
                gsm.add_points_to_player(20, gameSession.slots[rootIdx].player);
            }
            // also give point(s) to the judge if they get it right
            gsm.add_points_to_player(20, player);
        }
        // queue up the summary for all players in the game (include the judge)
        for (var slotIdx = 1; slotIdx < 7; ++slotIdx) {
            queue.push({
                state: {
                    name: 'SummaryState',
                    data: {
                        game_session: gameSession,
                        slot_idx: slotIdx,
                        selected: [grandchildIdx, parentIdx, rootIdx]
                    }
                },
                player: gameSession.slots[slotIdx].player
            });
        }
        // add to front of queue for judge, back of queue for others
        gsm.set_player_state(player, 'SummaryState', {game_session: gameSession, slot_idx: -1, selected: [grandchildIdx, parentIdx, rootIdx]});

        gameSession.has_outsider_judged = true;
    }
    return queue;
}

////////////////////////////////////////////////////////////////////////

function JudgeState(player) {
    this.name = 'JudgeState';
    this.player = player;
    this.source = null;
    this.game_session = null;
    this.slot_idx = null;
};

JudgeState.prototype = {
    on_event: function(gsm, event) {
        switch (event.name) {
            case 'judgement made':
                var queueList = onJudgment(gsm, this.player, this.game_session, this.source, event.image_path);
                for (var i = 0; i < queueList.length; ++i) {
                    var queue = queueList[i];
                    if (queue.player) {
                        queue.player.queue_state(queue.state);
                    } else {
                        gsm.queue_external_judge(queue.game_session, queue.slot_idx);
                    }
                }
                break;

            case 'disconnect':
                // Our judge has left, but someone must judge this work,
                // outsource it to an external participant instead.
                // gsm.queue_external_judge(this.game_session, this.slot_idx);
                break;

            default:
                break;
        }
    },
    on_start: function(gsm, data) {
        var game_session = data.game_session;
        var slot_idx = data.slot_idx;
        
        this.game_session = game_session;
        this.slot_idx = slot_idx;
        
        var judgementData = getJudgeImageSet(game_session, slot_idx);
        this.source = judgementData.source;

        if (slot_idx === 0) {
            game_session.first_judger = this.player;
        } else {
            game_session.last_judger = this.player;
        }
        game_session.judger_list.push(this.player);

        gsm.call_handler('start judging', this.player, judgementData);
    },
    on_finish: function(gsm) {
    }
};

///////////////////////////////////////////////////////////////////////

module.exports = JudgeState;
