var express = require('express')
var router = express.Router()
var db = require ('../../db')
var bcrypt = require('bcrypt')
var validator = require('validator')

router.get('/login', (req, res, next) => {
    db.query('SELECT a.account_id AS id, a.username, a.password, c.cl_type AS type FROM account a INNER JOIN common_lookup c ON a.type = c.common_lookup_id WHERE a.username = $1 OR a.email = $1 LIMIT 1', [validator.escape(req.query.user || '')], (err, result) => {
        if (err) return res.send({user: null, error: err.message})
        if (result.rowCount === 1) {
            bcrypt.compare(validator.escape(req.query.password || ''), result.rows[0].password, (err, same) => {
                if (err) return res.send({user: null, error: err.message})
                if (same) {
                    req.session.user = {
                        id: result.rows[0].id,
                        name: result.rows[0].username,
                        type: result.rows[0].type
                    }
                    db.query('UPDATE account SET last_login = CURRENT_TIMESTAMP WHERE account_id = $1', [req.session.user.id], (err, result) => {
                        if (err) console.error(err)
                    })
                    return res.send({user: req.session.user, error: null})
                } else {
                    return res.send({user: null, error: 'Invalid login'})
                }
            })
        } else {
            return res.send({user: null, error: 'Invalid login'})
        }
    })
})

router.get('/logout', (req, res, next) => {
    let redirect = req.session.redirect
    req.session.destroy((err) => {
        res.send({success: !Boolean(err), error: err, redirect: redirect})
    })
})

module.exports = router