var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Home - MTGBuilder', user: (req.session.user || false), scripts: ['/js/index.js'] });
});

module.exports = router;
