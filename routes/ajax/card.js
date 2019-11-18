var express = require('express')
var router = express.Router()
var mtg = require('mtgsdk')

// Card search
router.get('/', (req, res, next) => {
    res.send({cards: []})
})

// Card details
router.get('/:id', (req, res, next) => {
    res.send({card: req.params.id})
})

module.exports = router