var express = require('express');
var router = express.Router();

// User search
router.get('/', function(req, res, next) {
  res.render('index', { title: 'MTGBuilder' });
});

// User profile
router.get('/:id', function(req, res, next) {
  res.render('index', { title: 'MTGBuilder' });
});

// User friend list
router.get('/friends', function(req, res, next) {
  res.render('index', { title: 'MTGBuilder' });
});

// User decks
router.get('/:id/decks', function(req, res, next) {
    res.render('index', { title: 'MTGBuilder' });
});

// Edit profile
router.get('/edit', function(req, res, next) {
  res.render('index', { title: 'MTGBuilder' });
});

module.exports = router;
