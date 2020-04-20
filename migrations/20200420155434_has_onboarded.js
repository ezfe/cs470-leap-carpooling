exports.up = function(knex) {
  return knex.schema.table('users', table => {
    table.boolean('has_onboarded').notNullable().defaultTo(false)
  })
};

exports.down = function(knex) {
  return knex.schema.table('users', table => {
    table.dropColumn('has_onboarded')
  })
};
