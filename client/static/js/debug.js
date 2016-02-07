$(document).ready(function() {
	var currentSession = 0;
	var sessionTotal = 0;

	// Show the debug summary view, spy on active games!
	$('#debug > button').click(function() {
		currentSession = Math.max(0, Math.min(sessionTotal-1, currentSession));
		socket.emit('debug session data', currentSession);
	});

	$('#debugSummarySpace > div.inner > form.interim').submit(function() {
  	$('#debug > button').attr('disabled', false);
    $('#debugSummarySpace').addClass('not_shown');
    return false;
	});

	$('#debugSummarySpace > div.inner > form.interim > button.prev').click(function() {
		console.log('prev');
		currentSession = Math.max(0, currentSession - 1);
		socket.emit('debug session data', currentSession);
	});

	$('#debugSummarySpace > div.inner > form.interim > button.next').click(function() {
		console.log('next');
		currentSession = Math.max(0, Math.min(sessionTotal-1, currentSession + 1));
		socket.emit('debug session data', currentSession);
	});

	$('#debugSummarySpace > div.inner > form.interim > button.refresh').click(function() {
		console.log('refresh');
		currentSession = Math.max(0, Math.min(sessionTotal-1, currentSession));
		socket.emit('debug session data', currentSession);
	});

  socket.on('new connection', function(data) {
  	$('#debug > button').attr('disabled', true);
    $('#debugSummarySpace').addClass('not_shown');
  });

  socket.on('debug session count', function(data) {
  	sessionTotal = data;
    $('#debug > label.sessionCount > span').text(data);
    if (sessionTotal > 0) {
	  	$('#debug > button').attr('disabled', false);
	  }
  });

  socket.on('debug image counts', function(data) {
  	var $list = $('#debug > ul.imageCounts');
  	$list.children().remove();
  	for (var type in data) {
  		$list.append('<li>' + type + ' = ' + data[type] + '</li>');
  	}

  	// Show a simple alert so the viewer knows the system is still functioning.
  	$('#imagesUpdated').removeClass('not_shown').fadeIn(300);
  	setTimeout(function() {
  		$('#imagesUpdated').fadeOut(300);
  	}, 1000);
  });

  socket.on('debug session data', function(data) {
  	// console.log('received session data:', data);
  	$('#debug > button').attr('disabled', true);

  	$('#debugSummarySpace > div.inner > form.interim > label > span.sessionIndex').text(currentSession+1);

    $('#debugSummarySpace').removeClass('not_shown');
    $('#debugSummarySpace > div.inner > div.source').css('background-image', 'url("/static/images/no-drawing.png")');
    $('#debugSummarySpace > div.inner > div.sourceLarge').css('background-image', 'url("/static/images/no-drawing.png")');
    $('#debugSummarySpace > div.inner > label.nametag').text('');

  	if (!data) {
  		return;
  	}

    for (var i = 0; i < data.length; ++i) {
      $('#debugSummarySpace > div.inner > div.order' + i).css('background-image', 'url("' + data[i].image + '")');
      $('#debugSummarySpace > div.inner > label.nametag.order' + i).text(data[i].player);
    }
  });
});