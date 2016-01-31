var express = require('express');
var favicon = require('serve-favicon');
var path    = require('path');
var hbs     = require('handlebars');
var cons    = require('consolidate');

module.exports.init = function(app) {

  // Set our static directory.
  app.use('/static', express.static(path.join(__dirname, '..', 'client', 'static')));

  // Server a favorite icon!
  app.use(favicon(path.join(__dirname, '..', 'client', 'static', 'images', 'favicon.ico')));

  // Templating renderer.
  app.engine('html', cons.handlebars);
  app.set('view engine', 'html');
  app.set('views', './client/views');

  app.get('/', function(req, res) {
    res.render('index');
  });

  app.get('/drawer', function(req, res) {
    res.render('drawer');
  });

  app.get('/judge', function(req, res) {
    res.render('judging');
  });

  app.get('/start', function(req, res) {
    res.render('start');
  });

  app.get('/interim', function(req, res) {
    res.render('interim');
  });
}
