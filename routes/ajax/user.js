var express = require('express')
var router = express.Router()
var db = require('../../db')
var validator = require('validator')
var bcrypt = require('bcrypt')

// Search users
router.get('/', (req, res, next) => {
    let name = validator.trim(validator.escape(req.query.name || ''))
    let type = validator.trim(validator.escape((req.query.type || '').toLowerCase()))
    let query = "SELECT i.id, i.username, i.status, i.type, to_char(a.last_login, 'HH:MI PM on DD Mon YYYY') AS last_login FROM account_info i, account a WHERE i.id = a.account_id"
    if (name != '') {
        query += ` AND i.username LIKE '%${name}%'`
    }
    if (type != '') {
        query += ` AND i.type = '${type}'`
    }
    query += ' ORDER BY a.last_login DESC'

    db.query(query, [], (err, result) => {
        if (err)  {
            console.log(err)
            return res.send({users: null, error: 'Database error'})
        }
        res.send({users: result.rows, error: null})
    })
})

// User details
router.get('/:id', (req, res, next) => {
    let id = req.params.id
    if (!Boolean(Number(id))) return res.send({user: null, error: 'ID is not a number'})
    // Make use of the account_info view in the database
    // Only get everything if the current user is an admin or the user we're looking up
    let query = (req.session.user && (req.session.user.type == 'admin' || req.session.user.id == id) ? "SELECT * FROM account_info WHERE id = $1" : "SELECT username, status, type, joined, last_login FROM account_info WHERE id = $1")
    db.query(query, [id], (err, result) => {
        if (err) {
            console.log(err)
            return res.send({user: null, error: 'Database error'})
        }
        if (result.rowCount == 0) res.send({user: null, error: 'No user found'})
        res.send(result.rows[0])
    })
})

// Create user
router.post('/', function createUser(req, res, next) {
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

// Update or create user
router.put('/:id', (req, res, next) => {
    res.send({user: req.body.id})
})

// Get friends
router.get('/:id/friends', (req, res, next) => {
    res.send({user: req.params.id, friends: []})
})

// Create friend
router.post('/:id/friends', function createFriend(req, res, next) {
    res.send({user: req.body.id, friend: 0})
})

// Update or create friend
router.put('/:id/friends', (req, res, next) => {
    res.send({user: req.body.id, friend: 0})
})

// Delete friend
router.delete('/:id/friends', (req, res, next) => {
    res.send({user: req.body.id, friend: 0})
})

module.exports = router