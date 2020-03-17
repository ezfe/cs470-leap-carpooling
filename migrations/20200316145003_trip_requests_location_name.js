
exports.up = function(knex) {
  return knex.schema.table('trip_requests', (t) => {
    t.text('location_description').notNullable()
  })
};

exports.down = function(knex) {
  return knex.schema.table('trip_requests', (t) => {
    t.dropColumn('location_description')
  })
};
