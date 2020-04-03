
exports.up = function(knex) {
  knex.schema.table('trip_requests', table => {
    table.string('start_date')
    table.string('end_date')

  })
};

exports.down = function(knex) {
  knex.schema.table('trip_requests', table => {
    table.dropColumn('start_date')
    table.dropColumn('end_date')

  })
};
