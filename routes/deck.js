var express = require('express');
var router = express.Router();

// Deck search
router.get('/', function(req, res, next) {
  res.render('index', { title: 'MTGBuilder' });
});

// View deck
router.get('/:id', function(req, res, next) {
  res.render('index', { title: 'MTGBuilder' });
});

// Edit deck
router.get('/:id/edit', function(req, res, next) {
  res.render('index', { title: 'MTGBuilder' });
});

module.exports = router;
