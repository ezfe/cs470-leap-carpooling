
exports.up = function(knex) {
  return knex.schema.createTable('trip_requests', (t) => {
    t.increments('id').primary().unsigned()
    t.integer('member_id')
      .references('id')
      .inTable('users')
      .notNullable()
      .onDelete('cascade')
    t.enu('role', ['rider', 'driver'], { useNative: true, enumName: 'user_role' })
      .notNullable()
    t.text('location').notNullable()
    t.integer('deviation_limit').notNullable()
    t.enu('direction', ['towards_lafayette', 'from_lafayette'], { useNative: true, enumName: 'trip_direction' })
      .notNullable()
    
    t.timestamp('created_at').notNullable()
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('trip_requests')
};
