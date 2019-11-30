var express = require('express');
var router = express.Router();
var db = require('../db')

// User search
router.get('/', function(req, res, next) {
  if (!req.session.query) req.session.query = {name: ''}
  if (req.query && req.query.name) {
    req.session.query.name = req.query.name
    return res.redirect('/user')
  }
  let name = req.session.query.name
  req.session.query.name = ''
  db.query("SELECT cl_type FROM common_lookup WHERE cl_table = 'account' AND cl_column = 'type'", [], (err, result) => {
    types = []
    if (err) console.error(err)
    else result.rows.forEach(row => { types.push(row.cl_type[0].toUpperCase() + row.cl_type.slice(1)) })
    res.render('userSearch', {title: 'Users - MGTBuilder', extra: 'Users', scripts: ['/js/searchUser.js','/js/top.js'], styles: ['/css/search.css','/css/top.css'], query: name, user: (req.session.user || false), userTypes: types })
  })
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
