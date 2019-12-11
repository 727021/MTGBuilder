var express = require('express')
var router = express.Router()
var db = require('../../db')
var validator = require('validator')

// Deck search
router.get('/', (req, res, next) => {
    let query = 'SELECT d.deck_id AS id, d.account_id AS owner, a.username AS owner_name, d.title, c.cl_type AS view FROM deck d, account a, common_lookup c WHERE c.common_lookup_id = d.view AND d.account_id = a.account_id'
    let params = []
    if (req.query && req.query.title) {
        query += ` AND d.title ILIKE '%${req.query.title.trim() == '' ? 'Untitled' : validator.escape(req.query.title)}%'`
    }
    if (req.query && req.query.owner && Number(req.query.owner) && Number(req.query.owner) > 0) {
        params.push(Number(req.query.owner))
        query += ` AND d.account_id = $${params.length}`
    }
    if (!req.session.user || (req.query && req.query.owner && Number(req.query.owner) && Number(req.query.owner) > 0 && req.session.user.id != Number(req.query.owner))) {
        query += ' AND d.view = (SELECT common_lookup_id FROM common_lookup WHERE cl_table = \'deck\' AND cl_column = \'view\' AND cl_type = \'public\')'
    }
    db.query(query, params, (err, result) => {
        if (err) {
            console.error(err)
            return res.send({decks: null, error: 'Database error'})
        }
        res.send({decks: result.rows, error: null})
    })
})

// Recent decks
router.get('/recent', (req, res, next) => {
    res.send({decks: []})
})

// Deck details
router.get('/:id', (req, res, next) => {
    let id = validator.escape(req.params.id)
    if (!Number(id)) return res.send({deck: null, error: 'Invalid deck ID'})
    db.query('SELECT d.deck_id AS id, d.account_id AS owner, d.title, COALESCE(d.cards, \'{}\') AS cards, c.cl_type AS view FROM deck d, common_lookup c WHERE c.common_lookup_id = d.view AND d.deck_id = $1', [id], (err, result) => {
        if (err) {
            console.error(err)
            return res.send({deck: null, error: 'Database error'})
        }
        if (result.rowCount == 0) return res.send({deck: {}, error: null})
        res.send({deck: result.rows[0], error: null})
    })
})

// Copy deck
router.post('/:id', (req, res, next) => {
    if (!req.session.user) return res.send({id: null, error: 'User not logged in'})
    db.query('INSERT INTO deck (deck_id,account_id,title,cards,cover,view) (SELECT nextval(\'deck_deck_id_seq\'), $1, title, cards, cover, view FROM deck WHERE deck_id = $2) RETURNING deck_id', [req.session.user.id, +req.params.id], (err, result) => {
        if (err) {
            console.error(err)
            return res.send({id: null, error: 'Database error'})
        }
        res.send({id: result.rows[0].deck_id, error: null})
    })
})

// Create deck
router.post('/', (req, res, next) => {
    if (!req.session.user) return res.send({id: null})
    let title = validator.escape(req.body.title || 'Untitled')
    if (title.trim() == '') title = 'Untitled'
    let view = Number(req.body.view)
    if (!view || view < 3 || view > 5) view = 4
    db.query('INSERT INTO deck (account_id,title,view) VALUES ($1,$2,$3) RETURNING deck_id AS id', [req.session.user.id,title,view], (err, result) => {
        if (err) {
            console.error(err)
            return res.send({id: null, error: 'Database error'})
        }
        res.send({id: result.rows[0].id, error: null})
    })
})

// Update deck
router.put('/:id', (req, res, next) => {
    if (!req.session.user) return res.send({deck: null, error: 'User not logged in'})
    let id = validator.escape(req.params.id)
    if (!Number(id)) return res.send({deck: null, error: 'Invalid deck ID'})
    let title = req.body.title || 'Untitled'
    let cards = req.body.cards
    let view = Number(req.body.view)
    if (view < 3 || view > 5) view = 4
    db.query('SELECT account_id AS owner FROM deck WHERE deck_id = $1', [id], (err, result) => {
        if (err) {
            console.error(err)
            return res.send({deck: null, error: 'Database error'})
        }
        // If the current user doesn't own this deck, tell them the ID is invalid.
        // That way, they don't even know that this deck exists.
        if (result.rows[0].owner != req.session.user.id) return res.send({deck: null, error: 'Invalid deck ID'})
        db.query('UPDATE deck SET title = $1, cards = $2, view = $3, last_edit = CURRENT_TIMESTAMP WHERE deck_id = $4 RETURNING deck_id AS id, title, cards, view AS visibility', [title,cards,view,id], (err, result) => {
            if (err) {
                console.error(err)
                return res.send({deck: null, error: 'Database error'})
            }
            return res.send({deck: result.rows[0] || {}, error: null})
        })
    })
})

// Delete deck
router.delete('/:id', (req, res, next) => {
    if (!req.session.user) return res.send({delete: null, error: 'User not logged in'})
    if (!Number(req.params.id)) return res.send({delete: null, error: 'Invalid deck ID'})
    db.query('DELETE FROM deck WHERE deck_id = $1 RETURNING title', [Number(req.params.id)], (err, result) => {
        if (err) {
            console.error(err)
            return res.send({delete: null, error: 'Database error'})
        }
        res.send({delete: result.rows[0].title, error: null})
    })
})

module.exports = router