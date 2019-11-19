var express = require('express')
var router = express.Router()

router.get('/', (req, res, next) => {
    if (req.session.user) {
        return res.redirect('/')
    }
    res.render('login', { title: 'Log In - MTGBuilder', scripts: ['/js/login.js'], extra: 'Log In' })
})

module.exports = router