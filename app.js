var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var clientSessions = require('client-sessions');
var bodyParser = require('body-parser');
var assigner = require('assignUser');
var validator = require('express-validator');

var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/expresstest');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'RainbowDashPony.ico')));
console.log(__dirname);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(validator());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req,res,next){
    req.db = db;
    next();
});

//Pretty Print
if (app.get('env') === 'development') {
  app.locals.pretty = true;
}

app.use(clientSessions({
  cookieName: 'anExpressCookie',
  secret: 'supersecretsecret',
  duration: 1000*60*60*48,
  activeDuration: 1000*60*5
}));

app.use('/', routes);
app.use('/users', users);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
