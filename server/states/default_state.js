/**********************************************************************
Default State

A stand-in state to apply for states that don't need specialized logic.

//********************************************************************/

function DefaultState() {
	this.name = 'DefaultState';
    //
};
DefaultState.prototype = {
    // todo
};

///////////////////////////////////////////////////////////////////////

module.exports.DefaultState = DefaultState;
