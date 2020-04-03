
exports.up = function(knex) {
  return knex.schema.createTable('trip_requests', (t) => {
    t.increments('id').primary().unsigned()
    t.integer('member_id')
      .references('id')
      .inTable('users')
      .notNullable()
      .onDelete('cascade')
    t.enu('role', null, { existingType: true, useNative: true, enumName: 'user_role' })
      .notNullable()
    t.text('location').notNullable()
    t.text('location_description').notNullable()
    t.integer('deviation_limit').notNullable()
    t.enu('direction', ['towards_lafayette', 'from_lafayette'], { useNative: true, enumName: 'trip_direction' })
      .notNullable()
    t.date('first_date').notNullable()
    t.date('last_date').notNullable()

    t.timestamp('created_at').notNullable()
  })
};

exports.down = function(knex) {
  return Promise.all(
    [
      knex.schema.dropTable('trip_requests'),
      knex.raw('DROP TYPE trip_direction')
    ]
  )
};
