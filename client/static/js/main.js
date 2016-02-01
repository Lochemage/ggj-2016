$(document).ready(function() {
  var socket = io();
  var makingJudgement = false;
  var seconds = 40;

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
    socket.emit('game event', {name: 'play again'});
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

  $('#judgeSpace > img.choiceLarge').click(function() {
    if (makingJudgement) {
      var url = $(this).attr('src');
      var className = this.className.replace('choiceLarge', 'choice').replace(/ /g, '.');
      $('#judgeSpace > img.' + className).addClass('selected');
      $(this).addClass('not_shown');
      console.log('choice', url, 'made');
      socket.emit('game event', {name: 'judgement made', image_path: url});
      makingJudgement = false;
    }
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
      socket.emit('game event', {name: 'submit drawing', image_path: imgData});

      __hideSpaces();
    });
  });
  
  socket.on('update points', function(data) {
    var new_points = data;
    $('#score_point').text(new_points.toString());
  });

  socket.on('update board', function(data) {
    var all_points = data.allPoints;
    var total_players = data.totalPlayers;

    var $board = $('#scoreBoard');
    $board.children().remove();

    $board.append('<li><b>TOTAL PLAYERS: ' + total_players + '</li>');
    for (var i = 0; i < all_points.length; ++i) {
      $board.append('<li>' + all_points[i].player + ': ' + all_points[i].score + '</li>');
    }
  });

  socket.on('debug session count', function(data) {
    $('#debug > label.sessionCount > span').text(data);
  });

  socket.on('start idle', function(data) {
    __hideSpaces();
    $('#continueSpace').removeClass('not_shown');
  });

  socket.on('start judging', function(data) {
    __hideSpaces();
    
    $('#judgeSpace').removeClass('not_shown');
    $('#judgeSpace > img.choice').removeClass('selected');
    $('#judgeSpace > img.source').attr('src', data.source);
    $('#judgeSpace > img.upper.left').attr('src', data.choices[0]);
    $('#judgeSpace > img.upper.right').attr('src', data.choices[1]);
    $('#judgeSpace > img.lower.left').attr('src', data.choices[2]);
    $('#judgeSpace > img.lower.right').attr('src', data.choices[3]);

    makingJudgement = true;
  });

  socket.on('start summary', function(data) {
    __hideSpaces();

    $('#summarySpace').removeClass('not_shown');
    $('#summarySpace > img').removeClass('selected');

    for (var i = 0; i < data.length; ++i) {
      $('#summarySpace > img.order' + i).attr('src', data[i].image);
      $('#summarySpace > label.nametag.order' + i).text(data[i].player);
      if (data[i].selected) {
        $('#summarySpace > img.order' + i).addClass('selected');
      }
    }
  });

  function __hideSpaces() {
    $('#welcomeSpace').addClass('not_shown');
    $('#drawSpace').addClass('not_shown');
    $('#continueSpace').addClass('not_shown');
    $('#judgeSpace').addClass('not_shown');
    $('#summarySpace').addClass('not_shown');
  };

  function __startTimer($timer, done) {
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
