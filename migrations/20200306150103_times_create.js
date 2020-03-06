
exports.up = function(knex) {
  return knex.schema.createTable('trip_times', (t) => {
    t.increments('id').primary().unsigned()
    t.integer('request_id')
      .references('id')
      .inTable('trip_requests')
      .notNullable()
      .onDelete('cascade')
    t.date('date').notNullable()
    t.enu('time', ['morning', 'afternoon'], { useNative: true, enumName: 'trip_time' })
      .notNullable()
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('trip_times')
};
