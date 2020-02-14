const knex = require('knex')({
  client: 'pg',
  connection: {
    database: (process.env.PGDATABASE || 'carpooldb')
  }
})

module.exports = knex
