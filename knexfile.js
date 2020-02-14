module.exports = {
  development: {
    client: 'pg',
    connection: {
      database: (process.env.PGDATABASE || 'carpooldb')
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }
}
