/**********************************************************************
User

This is the connected user.

//********************************************************************/

function User() {
    this.socket = null;
    this.player = null;
};

User.prototype = {
    disconnect: function(gsm) {
        if (this.player) {
            this.player.disconnect(gsm);
        }
    }
};

module.exports = User;
