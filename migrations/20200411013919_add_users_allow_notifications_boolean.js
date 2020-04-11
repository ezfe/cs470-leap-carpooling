
exports.up = function(knex) {
  return knex.schema.table('users', table => {
    table.boolean('allow_notifications').notNullable().defaultTo(false)
  })
};

exports.down = function(knex) {
  return knex.schema.table('users', table => {
    table.dropColumn('allow_notifications')
  })
};
