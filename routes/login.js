var express = require('express');
const {Client} = require('pg')
var router = express.Router();

const pgClient = new Client(process.env.DATABASE_URL || {
    user: 'node_app_mtg',
    host: 'localhost',
    database: 'mtgbuilder_dev',
    password: 'node_app_mtg',
    port: 5432
})
pgClient.connect((err) => { if (err) console.error(err) })

/* GET home page. */
router.get('/login', function(req, res, next) {
    if (req.method === 'POST') {
        // Do login
        res.send({login:'fail',id:0})
    } else {
        pgClient.query("SELECT 'Hello World' AS result", (err, res) => {
            if (!err) console.log(res.rows[0].result)
            pgClient.end()
        })
        res.render('profile', { title: "Login" });
    }
});

module.exports = router;
