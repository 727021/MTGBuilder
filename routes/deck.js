var express = require('express');
var router = express.Router();
var db = require('../db')

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
  if (!req.session.user) return res.redirect('/login')
  req.session.redirect = ('/deck')
  if (!Number(req.params.id)) return res.redirect('/deck')
  db.query('SELECT d.deck_id AS id,d.account_id AS owner,d.title,COALESCE(d.cards, \'{}\') AS cards,c.cl_type AS view FROM deck d, common_lookup c WHERE c.common_lookup_id = d.view AND d.deck_id = $1', [+req.params.id], (err, result) => {
    if (err) return console.error(err)
    if (req.session.user.id != result.rows[0].owner) return res.redirect('/login')
    res.render('builder', { title: 'Deck Builder - MTGBuilder', extra: 'Deck Builder', scripts: ['/js/builder.js'], styles: ['/css/builder.css', '/css/search.css'], user: req.session.user, deck: result.rows[0] });
  })
});

module.exports = router;
