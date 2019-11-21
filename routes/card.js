var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  if (!req.session.query) req.session.query = {name: ''}
  if (req.query && req.query.name) {
    req.session.query.name = req.query.name
    return res.redirect('/card')
  }
  let name = req.session.query.name
  req.session.query.name = ''
  res.render('cardSearch', { title: 'Card Search - MTGBuilder', extra: 'Card Search', scripts: ['/js/searchCard.js'], styles: ['/css/search.css'], query: name })
});

module.exports = router;
