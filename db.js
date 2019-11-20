const { Pool } = require('pg')
const pool = new Pool(process.env.DATABASE_URL ? {connectionString: process.env.DATABASE_URL} : {
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT
})

module.exports = {
  /**
   * @param {string} queryText
   * @param {any} values
   * @param {(err: Error, result: QueryResult<any>) => void} callback
   */
  query: (queryText, values, callback) => {
    return pool.query(queryText, values, callback)
  },
  /**
   * @param {() => void} callback
   */
  end: (callback) => {
    return pool.end(callback)
  },
  /**
   * @returns {Pool}
   */
  getPool: () => { return pool }
}