var express = require('express')
var router = express.Router()
var db = require('../../db')
var validator = require('validator')
var bcrypt = require('bcrypt')

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
    let username = validator.trim(validator.escape(req.body.user))
    let email = validator.trim(validator.escape(req.body.email))
    let password = validator.trim(validator.escape(req.body.password))
    let confirm = validator.trim(validator.escape(req.body.confirm))

    if (username == '' || email == '' || password == '' || confirm == '') return res.send({user: null, error: 'All fields are required'})
    if (!validator.matches(username, /^[A-Za-z0-9_]+$/)) return res.send({user: null, error: 'Username must contain only letters, numbers, and underscore'})
    if (!validator.matches(username, /[A-Za-z0-9]+/)) return res.send({user: null, error: 'Username must contain at least one letter or number'})
    if (!validator.isEmail(email)) return res.send({user: null, error: 'Invalid email'})
    if (password.length < 8) return res.send({user: null, error: 'Password must be at least 8 characters long'})
    if (password !== confirm) return res.send({user: null, error: 'Passwords don\'t match'})

    db.query('SELECT account_id, username, email FROM account WHERE username = $1 OR email = $2 LIMIT 1', [username,email], (err, result) => {
        if (err) {
            console.error(err)
            return res.send({user: null, error: 'Database error'})
        }
        if (result.rowCount > 0) return res.send({user: null, error: `An account with that ${(username == result.rows[0].username) ? 'username' : 'email'} already exists`})

        bcrypt.hash(password, 10, (err, hash) => {
            if (err) return res.send({user: null, error: 'Hashing error'})
            db.query("INSERT INTO account (username,email,password,type) VALUES ($1,$2,$3,(SELECT common_lookup_id FROM common_lookup WHERE cl_table = 'account' AND cl_column = 'type' AND cl_type = 'default')) RETURNING account_id AS id", [username,email,hash], (err, result) => {
                if (err) {
                    console.error(err)
                    return res.send({user: null, error: 'Database error'})
                }
                return res.send({user: {id: result.rows[0].id}, error: null})
            })
        })
    })
})

// Update user
router.put('/:id', (req, res, next) => {
    res.send({user: req.body.id})
})

// Get friends
router.get('/:id/friends', (req, res, next) => {
    res.send({user: req.params.id, friends: []})
})

// Create friend
router.post('/:id/friends', (req, res, next) => {
    res.send({user: req.body.id, friend: 0})
})

// Update friend
router.put('/:id/friends', (req, res, next) => {
    res.send({user: req.body.id, friend: 0})
})

// Delete friend
router.delete('/:id/friends', (req, res, next) => {
    res.send({user: req.body.id, friend: 0})
})

module.exports = router