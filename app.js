var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');
var connect = require('connect'),
  fbsdk = require('facebook-sdk'),
  cookieParser = require('cookie-parser');


var app = express();
var cookieParser = require('cookie-parser');
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));




// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);

app.use('/users', users);


connect()
  .use(cookieParser())
  .use(bodyParser())
  .use(fbsdk.facebook({
    appId  : '2009227939306091',
    secret : 'b7bc77c3921e94fdccdb2f8635557c76'
  }))
  .use(function(req, res, next) {

    if (req.facebook.getSession()) {
      res.send('<a href="' + req.facebook.getLogoutUrl() + '">Logout</a>');

      // get my graph api information
      req.facebook.api('/me', function(me) {
          console.log(me);
      });

    } else {
        res.send('<a href="' + req.facebook.getLoginUrl() + '">Login</a>');
    }

  }).listen(3001);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
