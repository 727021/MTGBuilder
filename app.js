var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session')
require('dotenv').config()

var indexRouter = require('./routes/index');
var cardRouter = require('./routes/card')
var deckRouter = require('./routes/deck')
var userRouter = require('./routes/user')
var loginRouter = require('./routes/login')
var registerRouter = require('./routes/register')
var loginEndpoint = require('./routes/ajax/login')
var cardEndpoint = require('./routes/ajax/card')
var deckEndpoint = require('./routes/ajax/deck')
var userEndpoint = require('./routes/ajax/user')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var sess = {
  secret: 'keyboard cat',
  cookie: {},
  resave: false,
  saveUninitialized: true
}
if (app.get('env') === 'production') {
  app.set('trust proxy', 1) // trust first proxy
  sess.cookie.secure = true // serve secure cookies
}
app.use(session(sess))

app.use('/', indexRouter);
app.use('/card', cardRouter)
app.use('/deck', deckRouter)
app.use('/user', userRouter)
app.use('/login', loginRouter)
app.use('/register', registerRouter)
app.use('/ajax/', loginEndpoint)
app.use('/ajax/card', cardEndpoint)
app.use('/ajax/deck', deckEndpoint)
app.use('/ajax/user', userEndpoint)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
