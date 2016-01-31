$(document).ready(function() {
  var socket = io();

  function __hideWindows() {
    $('#startPrompt').addClass('not_shown');
    $('#drawSpace').addClass('not_shown');
  };

  function __startTimer($timer, done) {
    var seconds = 30;

    var startTime = new Date().getTime();
    var lastTime = startTime;
    var intervalId = setInterval(function() {
      var time = new Date().getTime();
      var elapsed = time - startTime;

      if (elapsed/1000 >= seconds) {
        clearInterval(intervalId);
        elapsed = seconds * 1000;
        done();
      }

      var degrees = 360 - (360 * (elapsed/1000/seconds));
      $timer.children('.spinner')
        .css({'-webkit-transform' : 'rotate('+ degrees +'deg)',
        '-moz-transform' : 'rotate('+ degrees +'deg)',
        '-ms-transform' : 'rotate('+ degrees +'deg)',
        'transform' : 'rotate('+ degrees +'deg)'});

      var opacity = 1;
      var ropacity = 0;
      if (degrees < 180) {
        opacity = 0;
        ropacity = 1;
      }
      $timer.children('.filler').css('opacity', opacity);
      $timer.children('.mask').css('opacity', ropacity);
      lastTime = time;
    }, 10);
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
    $('#drawSpace > .previewContainer > img.preview').attr('src', data.image);
    prepareCanvas();
    __startTimer($('#drawSpace > .timer'), function() {
      console.log('time over!');
    });
  });
});
