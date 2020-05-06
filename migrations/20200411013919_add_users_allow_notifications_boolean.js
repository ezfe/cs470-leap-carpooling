
exports.up = function(knex) {
  return knex.schema.table('users', table => {
    table.boolean('allow_notifications').notNullable().defaultTo(true)
  })
};

exports.down = function(knex) {
  return knex.schema.table('users', table => {
    table.dropColumn('allow_notifications')
  })
};
