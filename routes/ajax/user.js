var express = require('express')
var router = express.Router()
var db = require('../../db')
var validator = require('validator')
var bcrypt = require('bcrypt')

// Get followers
router.get('/followers', (req, res, next) => {
    db.query('SELECT a.username AS account_from, cl.cl_type AS status, f.date_changed FROM follower f, account a, common_lookup cl WHERE f.account_to = $1 AND f.account_from = a.account_id AND f.status = cl.common_lookup_id', [Number((req.query || req.session.user || {id: 0}).id) || 0], (err, result) => {
        if (err) {
            console.error(err)
            return res.send({friends: null, error: 'Database error'})
        }
        res.send({friends: result.rows, error: null})
    })
})

// Create follower
router.post('/follow', function createFriend(req, res, next) {
    if (!req.session.user) res.send({follow: null, error: 'User not logged in'})
    let id = req.session.user.id
    if (!req.body || !req.body.id) return res.send({follow: null, error: 'Invalid user'})
    let follow = Number(req.body.id)
    let status = req.body.status || 'sent'
    if (status !== 'sent' && status !== 'accepted') status = 'sent'
    db.query('SELECT f.account_from, f.account_to, cl.cl_type AS status FROM follower f, common_lookup cl WHERE f.account_from = $1 AND f.account_to = $2 AND f.status = cl.common_lookup_id', [id, follow], (err, result) => {
        if (err) {
            console.error(err)
            return res.send({follow: null, error: 'Database error'})
        }
        if (result.rowCount > 0) return res.send({follow: result.rows[0], error: null})
        db.query('INSERT INTO follower (account_from,account_to,status) SELECT a1.account_id, a2.account_id, cl.common_lookup_id FROM account a1, account a2, common_lookup cl WHERE a1.account_id = $1 AND a2.account_id = $2 AND cl.cl_table = \'follower\' AND cl.cl_column = \'status\' AND cl.cl_type = $3', [id,follow,status], (err, result) => {
            if (err) {
                console.error(err)
                return res.send({follow: null, error: 'Database error'})
            }
            res.send({follow: {account_from: id, account_to: follow, status: status}, error: null})
        })
    })
})

// Update or create follower
router.put('/follow', (req, res, next) => {
    if (!req.session.user) res.send({follow: null, error: 'User not logged in'})
    let id = req.session.user.id
    if (!req.body || !req.body.id) return res.send({follow: null, error: 'Invalid user'})
    let follow = Number(req.body.id)
    let status = req.body.status || 'sent'
    if (status !== 'sent' && status !== 'accepted') status = 'sent'
    db.query('SELECT follower_id FROM follower WHERE account_from = $1 AND account_to = $2', [id,friend], (err, result) => {
        if (err) {
            console.error(err)
            res.send({friend: null, error: 'Database error'})
        }
        if (result.rowCount == 0) return createFriend(req, res, next)
        db.query('UPDATE follower SET status = (SELECT common_lookup_id FROM common_lookup WHERE cl_table = \'follower\' AND cl_column = \'status\' AND cl_type = $1) WHERE account_from = $2 AND account_to = $3', [status,id,follow], (err, result) => {
            if (err) {
                console.error(err)
                res.send({friend: null, error: 'Database error'})
            }
            res.send({follow: {account_from: id, account_to: follow, status: status}, error: null})
        })
    })
})

// Unfollow
router.delete('/follow', (req, res, next) => {
    if (!req.session.user) res.send({follow: null, error: 'User not logged in'})
    let id = req.session.user.id
    if (!req.body || !req.body.id) return res.send({follow: null, error: 'Invalid user'})
    let follow = Number(req.body.id)
    db.query('DELETE FROM follower WHERE account_from = $1 AND account_to = $2', [id, follow], (err, result) => {
        if (err) {
            console.error(err)
            return res.send({unfollow: false, error: 'Database error'})
        }
        res.send({unfollow: true, error: null})
    })
})

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

module.exports = router