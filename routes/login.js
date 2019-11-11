var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/login', function(req, res, next) {
    if (req.method === 'POST') {
        // Do login
        res.send({login:'fail',id:0})
    } else {
        res.render('profile', { title: "Login" });
    }
});

module.exports = router;
