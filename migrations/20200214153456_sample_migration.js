
exports.up = function(knex) {
  return knex.schema.createTable('sample_table', (t) => {
    t.increments('id').primary().unsigned()
    t.string('string_field')
    t.timestamp('created_at')
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('sample_table')
};
