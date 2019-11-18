var express = require('express')
var router = express.Router()
var pg = require('node-postgres')

// Search users
router.get('/', (req, res, next) => {
    res.send({users: []})
})

// User details
router.get('/:id', (req, res, next) => {
    res.send({user: req.params.id})
})

// Create user
router.post('/', (req, res, next) => {
    res.send({user: 0})
})

// Update user
router.put('/:id', (req, res, next) => {
    res.send({user: req.params.id})
})

// Get friends
router.get('/:id/friends', (req, res, next) => {
    res.send({user: req.params.id, friends: []})
})

// Create friend
router.post('/:id/friends', (req, res, next) => {
    res.send({user: req.params.id, friend: 0})
})

// Update friend
router.put('/:id/friends', (req, res, next) => {
    res.send({user: req.params.id, friend: 0})
})

// Delete friend
router.delete('/:id/friends', (req, res, next) => {
    res.send({user: req.params.id, friend: 0})
})

module.exports = router