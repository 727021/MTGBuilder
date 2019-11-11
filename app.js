var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var dashboardRouter = require('./routes/dashboard');
var adminRouter = require('./routes/admin');
var deckRouter = require('./routes/deck')
var cardRouter = require('./routes/card')
var profileRouter = require('./routes/profile')
var loginRouter = require('./routes/login')
var registerRouter = require('./routes/register')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', dashboardRouter);
app.use('/dashboard', (req, res, next) => {
  res.redirect('../')
});
app.use('/admin', adminRouter);
app.use('/deck', deckRouter)
app.use('/card', cardRouter)
app.use('/profile', profileRouter)
app.use('/profile', loginRouter)
app.use('/profile', registerRouter)
app.use('/login', (req, res, next) => {
  res.redirect('../profile/login')
})
app.use('/register', (req, res, next) => {
  res.redirect('../profile/register')
})

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
