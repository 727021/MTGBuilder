var express = require('express');
var router = express.Router();
var db = require('../db')
var validator = require('validator')

// Deck search
router.get('/', function(req, res, next) {
  res.render('index', { title: 'MTGBuilder' });
});

// View deck
router.get('/:id', function(req, res, next) {
  req.session.redirect = ''
  if (!Number(req.params.id)) return res.redirect('/deck')
  db.query('SELECT d.deck_id AS id,d.account_id AS owner,a.username AS owner_username,d.title,COALESCE(d.cards, \'{}\') AS cards,c.cl_type AS view FROM deck d, common_lookup c, account a WHERE c.common_lookup_id = d.view AND d.account_id = a.account_id AND d.deck_id = $1', [+req.params.id], (err, result) => {
    if (err) {
      console.error(err)
      return res.redirect('/deck')
    }
    if (result.rowCount == 0) return res.redirect('/deck')
    if (result.rows[0].view == 'public' || (req.session.user && req.session.user.id == result.rows[0].owner)) {
      let cards = []
      let deck = result.rows[0]
      let dCards = JSON.parse(deck.cards)
      let cardTotal = 0
      for (let card in dCards) {
        if (dCards.hasOwnProperty(card))
          cards.push({id: card, name: dCards[card].name, img: dCards[card].img, count: dCards[card].count})
          cardTotal += dCards[card].count
      }
      deck.cards = cards
      deck.cardTotal = cardTotal
      res.render('deck', {title: 'Deck View - MTGBuilder', extra: 'Deck View', styles: ['/css/builder.css', '/css/search.css'], scripts: ['/js/deck.js'], user: req.session.user, deck: deck})
    } else {
      res.redirect('/deck')
    }
  })
});

// Edit deck
router.get('/:id/edit', function(req, res, next) {
  if (!req.session.user) return res.redirect('/login')
  req.session.redirect = ('/deck')
  if (!Number(req.params.id)) return res.redirect('/deck')
  db.query('SELECT d.deck_id AS id,d.account_id AS owner,d.title,COALESCE(d.cards, \'{}\') AS cards,c.cl_type AS view FROM deck d, common_lookup c WHERE c.common_lookup_id = d.view AND d.deck_id = $1', [+req.params.id], (err, result) => {
    if (err) return console.error(err)
    if (req.session.user.id != result.rows[0].owner) return res.redirect('/login')
    res.render('builder', { title: 'Deck Builder - MTGBuilder', extra: 'Deck Builder', scripts: ['/js/builder.js'], styles: ['/css/builder.css', '/css/search.css'], user: req.session.user, deck: {id: result.rows[0].id, owner: result.rows[0].owner, title: validator.unescape(result.rows[0].title), cards: result.rows[0].cards, view: result.rows[0].view} });
  })
});

module.exports = router;
