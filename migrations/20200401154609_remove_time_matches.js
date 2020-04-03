
exports.up = function(knex) {
  return knex.schema.table('trip_matches', (t) => {
    t.dropColumn('time')
  })
};

exports.down = function(knex) {
  return knex.schema.table('trip_matches', (t) => {
    t.enu('time', null, { useNative: true, existingType: true, enumName: 'trip_time' })
      .notNullable()
  })
};
