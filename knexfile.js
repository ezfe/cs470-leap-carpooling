module.exports = {
  development: {
    client: 'pg',
    connection: {
      host: (process.env.PGHOST || 'localhost'),
      user: (process.env.PGUSER || 'carpool'),
      password: (process.env.PGPASSWORD || 'carpooldb'),
      database: (process.env.PGDATABASE || 'carpooldb')
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }
}
