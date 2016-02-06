$(document).ready(function() {
  socket.on('debug session count', function(data) {
    $('#debug > label.sessionCount > span').text(data);
  });

  socket.on('debug image counts', function(data) {
  	var $list = $('#debug > ul.imageCounts');
  	$list.children().remove();
  	for (var type in data) {
  		$list.append('<li>' + type + ' = ' + data[type] + '</li>');
  	}
  });
});