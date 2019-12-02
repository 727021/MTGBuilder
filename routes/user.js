var express = require('express');
var router = express.Router();
var validator = require('validator')
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

// Edit profile
router.get('/edit', function(req, res, next) {
  res.render('index', { title: 'MTGBuilder', extra: 'Edit Profile' });
});

// User friend list
router.get('/friends', function(req, res, next) {
  res.render('index', { title: 'MTGBuilder', extra: 'Friends' });
});

// User profile
router.get('/:id', function(req, res, next) {
  let id = Number(validator.escape(req.params.id)) || 0
  db.query('SELECT * FROM account_info WHERE id = $1', [id], (err, result) => {
    if (err || result.rowCount === 0) {
      if (err) console.log(err)
      return res.redirect('/user')
    }
    let profile = result.rows[0]
    db.query('SELECT COUNT(id_to) FROM friend_list WHERE id_from = $1', [id], (err, result) => {
      if (err || result.rowCount === 0) {
        if (err) console.log(err)
        return res.redirect('/user')
      }
      profile.friendsCount = result.rows[0].count
      if (req.session.user && id == req.session.user.id) res.render('ownProfile', {title: `Profile - ${profile.username} - MTGBuilder`, extra: `Profile - ${profile.username}`, scripts: ['/js/ownProfile.js'], user: (req.session.user || false), profile: profile})
      else {
        db.query('SELECT status FROM friend_list WHERE id_from = $1 AND id_to = $2 OR id_from = $2 AND id_to = $1', [id, (req.session.user || {id:0}).id], (err, result) => {
          if (err) {
            console.log(err)
            return res.redirect('/user')
          }
          profile.friendStatus = result.rowCount == 0 ? 'none' : result.rows[0].status
          res.render('profile', {title: `Profile - ${profile.username} - MTGBuilder`, extra: `Profile - ${profile.username}`, scripts: ['/js/profile.js'], user: (req.session.user || false), profile: profile})
        })
      }
    })
  })
});

// User decks
router.get('/:id/decks', function(req, res, next) {
    res.render('index', { title: 'MTGBuilder' });
});

module.exports = router;
