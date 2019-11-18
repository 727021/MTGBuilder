var express = require('express')
var router = express.Router()
var mtg = require('mtgsdk')

// Deck search
router.get('/', (req, res, next) => {
    res.send({decks: []})
})

// Recent decks
router.get('/recent', (req, res, next) => {
    res.send({decks: []})
})

// Deck details
router.get('/:id', (req, res, next) => {
    res.send({deck: req.params.id})
})

// Create deck
router.post('/', (req, res, next) => {
    res.send({deck: 0})
})

// Update deck
router.put('/:id', (req, res, next) => {
    res.send({deck: 0})
})

// Delete deck
router.delete('/:id', (req, res, next) => {
    res.send({deck: 0})
})

module.exports = router