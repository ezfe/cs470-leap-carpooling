/*
 * This file is based on the file described at:
 * https://node-postgres.com/guides/project-structure
 */

const { Pool } = require('pg')

const pool = new Pool()

module.exports = {
  query: (text, params) => pool.query(text, params)
  // getClient: (callback) => {
  //   pool.connect((err, client, done) => {
  //     callback(err, client, done)
  //   })
  // }
}
