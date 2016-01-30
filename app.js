var express = require('express');
var urls = require('./server/urls');
var connect = require('./server/connect');
var app = express();
var http = require('http').Server(app);

var listener = http.listen(process.env.PORT || 5555, function() {
  var host = listener.address().address;
  var port = listener.address().port;

  console.log("=====================================================");
  console.log('Server listening on http://' + (host == '::'? 'localhost': host) + ":" + port);
  console.log("Press CTRL+C to shutdown the server.");
  console.log("=====================================================\n");
});

urls.init(app);
connect.init(http);
