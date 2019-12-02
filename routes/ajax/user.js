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
        if (result.rowCount === 0) return res.send({users: null, error: 'No users found'})
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
        if (result.rowCount == 0) return res.send({user: null, error: 'No user found'})
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
    if (!(req.session.user && (req.session.user.id == req.params.id || req.session.user.type == 'admin')))
        return res.status(403).send({user: null, error: 'User not logged in'})
    if (!req.query || !(req.query.username || req.query.password || req.query.email)) {
        db.query('SELECT * FROM account_info WHERE id = $1', [req.params.id], (err, result) => {
            if (err) {
                console.error(err)
                return res.send({user: null, error: 'Database error'})
            }
            return res.send({user: result.rows[0], error: null})
        })
    } else {
        let username = validator.trim(validator.escape(req.query.username || ''))
        let password = validator.trim(validator.escape(req.query.password || ''))
        let email = validator.trim(validator.escape(req.query.email || ''))
        if (username != '' && !validator.matches(username, /^[A-Za-z0-9_]+$/)) return res.send({user: null, error: 'Username must contain only letters, numbers, and underscore'})
        if (username != '' && !validator.matches(username, /[A-Za-z0-9]+/)) return res.send({user: null, error: 'Username must contain at least one letter or number'})
        if (email != '' && !validator.isEmail(email)) return res.send({user: null, error: 'Invalid email'})
        if (password != '' && password.length < 8) return res.send({user: null, error: 'Password must be at least 8 characters long'})
        query = []
        params = []
        if (username != '') {
            params.push(username)
            query.push(`username = $${params.length}`)
        }
        if (password != '') {
            params.push(bcrypt.hashSync(password, 10))
            query.push(`password = $${params.length}`)
        }
        if (email != '') {
            params.push(email)
            query.push(`email = $${params.length}`)
        }
        params.push(req.params.id)
        db.query(`UPDATE account SET ${query.join(', ')} WHERE id = $${params.length} RETURNING account_id`, params, (err, result) => {
            if (err) {
                console.error(err)
                return res.send({user: null, error: 'Database error'})
            }
            db.query('SELECT * FROM account_info WHERE id = $1', [result.rows[0].account_id], (err, result) => {
                if (err) {
                    console.error(err)
                    return res.send({user: null, error: 'Database error'})
                }
                res.send({user: result.rows[0], error: null})
            })
        })
    }

})

// Get friends
router.get('/:id/friends', (req, res, next) => {
    db.query(`SELECT * FROM friend_list WHERE id_from = $1${!(req.session.user && req.session.user.id == req.params.id) ? ' AND status = \'accepted\'' : ''}`, [validator.escape(req.params.id)], (err, result) => {
        if (err) {
            console.error(err)
            return res.send({friends: null, error: 'Database error'})
        }
        res.send({friends: result.rows, error: null})
    })
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