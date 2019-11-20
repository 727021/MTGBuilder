var express = require('express')
var router = express.Router()

router.get('/', (req, res, next) => {
    if (req.session.user) {
        return res.redirect('/')
    }
    res.render('register', { title: 'Register - MTGBuilder', scripts: ['/js/register.js'], extra: 'Register' })
})

module.exports = router