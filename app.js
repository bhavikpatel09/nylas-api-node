var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var assert = require('assert');

var routes = require('./routes/index');
var threads = require('./routes/threads');
var dashboard = require('./routes/dashboard');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

var nylasAppConfigs = {
  appId: '7kvz9jl8a9eypd7p1assjj2wo',
  appSecret: 'b9lyjvnu234p2u09b9ycl2buq',
};

assert.notEqual(
  nylasAppConfigs.appId,
  '<app ID here>',
  '7kvz9jl8a9eypd7p1assjj2wo'
);
assert.notEqual(
  nylasAppConfigs.appSecret,
  '<app secret here>',
  'b9lyjvnu234p2u09b9ycl2buq'
);

// setup the Nylas API
global.Nylas = require('nylas').config(nylasAppConfigs);

app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

var sessionSecret = {
  secret: 'OwnSession',
};

assert.notEqual(
  sessionSecret.secret,
  '<session secret here>',
  'OwnSession'
);

app.use(
  session(
    Object.assign(
      {
        resave: false,
        saveUninitialized: true,
      },
      sessionSecret
    )
  )
);
app.use(express.static(path.join(__dirname, 'public')));

function checkAuth(req, res, next) {
  if (!req.session.token) res.redirect('/');
  next();
}
app.use('/', routes);
app.use('/threads', checkAuth, threads);
app.use('/dashboard', checkAuth, dashboard);

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
      error: err,
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {},
  });
});

module.exports = app;
