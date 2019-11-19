var express = require('express')
var router = express.Router()
var db = require ('../../db')
var bcrypt = require('bcrypt')

router.get('/login', (req, res, next) => {
    db.query('SELECT a.account_id AS id, a.username, a.password, c.cl_type AS type FROM account a INNER JOIN common_lookup c ON a.type = c.common_lookup_id WHERE a.username = $1 OR a.email = $1 LIMIT 1', [req.query.user || ''], (err, result) => {
        if (err) return res.send({user: null, error: err.message})
        if (result.rowCount === 1) {
            bcrypt.compare(req.query.password || '', result.rows[0].password, (err, same) => {
                if (err) return res.send({user: null, error: err.message})
                if (same) {
                    req.session.user = {
                        id: result.rows[0].id,
                        name: result.rows[0].username,
                        type: result.rows[0].type
                    }
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
    req.session.destroy((err) => {
        res.send({success: !Boolean(err), error: err})
    })
})

module.exports = router