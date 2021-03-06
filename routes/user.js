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
  if (!req.session.user) return res.redirect('/login')
  req.session.redirect = `/user/${req.session.user.id}`
  db.query('SELECT * FROM account_info WHERE id = $1', [req.session.user.id], (err, result) => {
    if (err) {
      console.error(err)
      return res.redirect(`/user/${req.session.user.id}`)
    }
    console.log(result.rows[0])
    res.render('editProfile', { title: 'Edit Profile - MTGBuilder', extra: 'Edit Profile', user: req.session.user, profile: result.rows[0], scripts: ['/js/editProfile.js'] });
  })
});

// User followers list
router.get('/followers', function(req, res, next) {
  if (!req.session.user) return res.redirect('/login')
  req.session.redirect = `/user/${req.session.user.id}`
  db.query('SELECT a.account_id AS id, a.username AS username, TO_CHAR(f.date_changed, \'DD Mon YYYY\') AS date_changed FROM follower f, account a WHERE f.account_to = $1 AND f.account_from = a.account_id AND f.status = (SELECT common_lookup_id FROM common_lookup WHERE cl_table = \'follower\' AND cl_column = \'status\' AND cl_type = \'accepted\') ORDER BY f.date_changed DESC', [req.session.user.id], (err, result) => {
    if (err) {
      console.error(1)
      console.error(err)
      return res.redirect(`/user/${req.session.user.id}`)
    }
    let followers = result.rows
    db.query('SELECT a.account_id AS id, a.username AS username, TO_CHAR(f.date_changed, \'DD Mon YYYY\') AS date_changed FROM follower f, account a WHERE f.account_to = $1 AND f.account_from = a.account_id AND f.status = (SELECT common_lookup_id FROM common_lookup WHERE cl_table = \'follower\' AND cl_column = \'status\' AND cl_type = \'sent\') ORDER BY f.date_changed DESC', [req.session.user.id], (err, result) => {
      if (err) {
        console.error(2)
        console.error(err)
        return res.redirect(`/user/${req.session.user.id}`)
      }
      let requests = result.rows
      db.query('SELECT a.account_id AS id, a.username AS username, TO_CHAR(f.date_changed, \'DD Mon YYYY\') AS date_changed, cl.cl_type AS status FROM follower f, account a, common_lookup cl WHERE f.account_from = $1 AND cl.common_lookup_id = f.status AND a.account_id = f.account_to GROUP BY cl.cl_type, a.username, a.account_id, f.date_changed ORDER BY f.date_changed', [req.session.user.id], (err, result) => {
        if (err) {
          console.error(3)
          console.error(err)
          return res.redirect(`/user/${req.session.user.id}`)
        }
        let followed = result.rows
        res.render('followers', { title: 'Followers - MTGBuilder', extra: 'Followers', user: req.session.user, followers: followers, requests: requests, followed: followed, scripts: ['/js/followers.js'] })
      })
    })
  })
});

// User profile
router.get('/:id', function(req, res, next) {
  req.session.redirect = ``
  let id = Number(validator.escape(req.params.id)) || 0
  db.query('SELECT * FROM account_info WHERE id = $1', [id], (err, result) => {
    if (err || result.rowCount === 0) {
      if (err) console.log(err)
      return res.redirect('/user')
    }
    let profile = result.rows[0]
    db.query('SELECT COUNT(*) FROM follower WHERE account_to = $1 AND status = (SELECT common_lookup_id FROM common_lookup WHERE cl_table = \'follower\' AND cl_column = \'status\' AND cl_type = \'accepted\')', [id], (err, result) => {
      if (err || result.rowCount === 0) {
        if (err) console.log(err)
        return res.redirect('/user')
      }
      profile.followers = result.rows[0].count
      if (req.session.user && id == req.session.user.id) {
        res.render('ownProfile', {title: `Profile - ${profile.username} - MTGBuilder`, extra: `Profile - ${profile.username}`, scripts: ['/js/ownProfile.js'], user: (req.session.user || false), profile: profile})
      }
      else {
        db.query('SELECT cl.cl_type AS status FROM follower f, common_lookup cl WHERE f.account_from = $1 AND f.account_to = $2 AND f.status = cl.common_lookup_id', [(req.session.user || {id:0}).id, id], (err, result) => {
          if (err) {
            console.log(err)
            return res.redirect('/user')
          }
          profile.follow = result.rowCount == 0 ? 'none' : result.rows[0].status
          db.query('SELECT deck_id AS id, title FROM deck WHERE account_id = $1 AND view = (SELECT common_lookup_id FROM common_lookup WHERE cl_table = \'deck\' AND cl_column = \'view\' AND cl_type = \'public\') ORDER BY last_edit DESC', [id], (err, result) => {
            if (err) {
              console.log(err)
              profile.decks = []
            } else{
              profile.decks = result.rows
            }
            res.render('profile', {title: `Profile - ${profile.username} - MTGBuilder`, extra: `Profile - ${profile.username}`, scripts: ['/js/profile.js'], user: (req.session.user || false), profile: profile})
          })
        })
      }
    })
  })
});

// User decks (NOT USED)
router.get('/:id/decks', function(req, res, next) {
    res.redirect(`./`)
});

module.exports = router;
