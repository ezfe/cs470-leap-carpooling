
exports.up = function(knex) {
  return knex.schema.table('trip_matches', table => {
    table.boolean('notification_sent').notNullable().defaultTo(false)
  })
};

exports.down = function(knex) {
  return knex.schema.table('trip_matches', table => {
    table.dropColumn('notification_sent')
  })
};
