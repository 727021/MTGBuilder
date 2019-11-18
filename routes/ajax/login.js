var express = require('express')
var router = express.Router()
var pg = require('node-postgres')

router.get('/login', (req, res, next) => {
    res.send({user: 0})
})

router.get('/logout', (req, res, next) => {
    res.send({user: 0})
})

module.exports = router