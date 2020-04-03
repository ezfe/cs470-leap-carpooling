
exports.up = function(knex) {
  return knex.schema.createTable('pair_rejections', (t) => {
    t.increments('id').primary().unsigned()
    t.integer('blocker_id')
      .references('id')
      .inTable('users')
      .notNullable()
      .onDelete('cascade')
    t.integer('blockee_id')
      .references('id')
      .inTable('users')
      .notNullable()
      .onDelete('cascade')
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('pair_rejections')
};
