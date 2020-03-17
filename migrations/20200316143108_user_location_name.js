
exports.up = function(knex) {
  return knex.schema.table('users', (t) => {
    t.text('default_location_description')
  })
};

exports.down = function(knex) {
  return knex.schema.table('users', (t) => {
    t.dropColumn('default_location_description')
  })
};
