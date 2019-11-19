const { Pool } = require('pg')
const pool = new Pool(process.env.DATABASE_URL ? {connectionString: process.env.DATABASE_URL} : {
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT
})

module.exports = {
  query: (text, params, callback) => {
    return pool.query(text, params, callback)
  }
}