/**********************************************************************
Default State

A stand-in state to apply for states that don't need specialized logic.

//********************************************************************/

function DefaultState() {
    //
};
DefaultState.prototype = {
    // todo
};

///////////////////////////////////////////////////////////////////////

module.exports.DefaultState = DefaultState;
module.exports.eventDataPhaseToStateMethod = {
    START: 'on_start',
    FINISH: 'on_finish'
};
