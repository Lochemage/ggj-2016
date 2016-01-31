$(document).ready(function() {
  var socket = io();

  function __hideWindows() {
    $('#startPrompt').addClass('not_shown');
    $('#drawSpace').addClass('not_shown');
  };

  // User submits a name.
  $('form.nametag').submit(function() {
    var name = $('#startPrompt > .nametag > input').val();
    if (name) {
      socket.emit('start game', name);
      return false;
    }
  });

  // User is now starting a game session.
  socket.on('start game', function(data) {
    __hideWindows();

    $('#drawSpace').removeClass('not_shown');
    prepareCanvas();
  });
});
