$(document).ready(function() {
  var socket = io();

  // Initialize the drawing canvas once.
  prepareCanvas();

  // User submits a name.
  $('form.nametag').submit(function() {
    var name = $('#welcomeSpace > .nametag > input').val();
    if (name) {
      socket.emit('start game', name);
      return false;
    }
  });

  // User submits to play another round.
  $('form.interim').submit(function() {
    socket.emit('play again');
    return false;
  });

  $('#judgeSpace > img.choice').hover(function() {
    var classes = this.className.replace('choice', 'choiceLarge').replace('not_shown', '').replace(/ /g, '.');

    $('#judgeSpace > img.choiceLarge').addClass('not_shown');
    $('#judgeSpace > img.choiceLarge.' + classes).removeClass('not_shown');
  });

  $('#judgeSpace > img.choiceLarge').mouseleave(function() {
    $(this).addClass('not_shown');
  });

  $('#summarySpace > img.source').hover(function() {
    var classes = this.className.replace('source', 'sourceLarge').replace('not_shown', '').replace(/ /g, '.');

    $('#summarySpace > img.sourceLarge').addClass('not_shown');
    $('#summarySpace > img.sourceLarge.' + classes).removeClass('not_shown');
  });

  $('#summarySpace > img.sourceLarge').mouseleave(function() {
    $(this).addClass('not_shown');
  });

  // User is now starting a game session.
  socket.on('start game', function(data) {
    __hideSpaces();

    $('#drawSpace').removeClass('not_shown');
    $('#drawSpace > img.preview').attr('src', data.image);
    clearCanvas();
    __startTimer($('#drawSpace > .timer'), function() {
      var imgData = retrieveCanvasImage();
      console.log('time over!');
      socket.emit('submit drawing', imgData);

      __hideSpaces();
      $('#continueSpace').removeClass('not_shown');
    });
  });

  function __hideSpaces() {
    $('#welcomeSpace').addClass('not_shown');
    $('#drawSpace').addClass('not_shown');
    $('#continueSpace').addClass('not_shown');
    $('#judgeSpace').addClass('not_shown');
    $('#summarySpace').addClass('not_shown');
  };

  function __startTimer($timer, done) {
    var seconds = 40;

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
});
