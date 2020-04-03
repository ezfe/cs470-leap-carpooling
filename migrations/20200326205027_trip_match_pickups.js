
exports.up = function(knex) {
  return knex.schema.table('trip_matches', (t) => {
    t.enu('first_portion', ['driver', 'rider'], { useNative: true, enumName: 'first_portion' })
      .notNullable()
      .defaultTo('driver')
  })
};

exports.down = function(knex) {
  return Promise.all(
    [
      knex.schema.table('trip_matches', (t) => {
        t.dropColumn('first_portion')
      }),
      knex.raw('DROP TYPE first_portion')
    ]
  )
};
