
exports.up = function(knex) {
  return knex.schema.createTable('trip_matches', (t) => {
    t.increments('id').primary().unsigned()
    t.integer('driver_request_id')
      .references('id')
      .inTable('trip_requests')
      .notNullable()
      .onDelete('cascade')
    t.integer('rider_request_id')
      .references('id')
      .inTable('trip_requests')
      .notNullable()
      .onDelete('cascade')
    
    t.date('first_date').notNullable()
    t.date('last_date').notNullable()
  
    t.boolean('rider_confirmed').notNullable()
    t.boolean('driver_confirmed').notNullable()

    t.enu('first_portion', null, { existingType: true, useNative: true, enumName: 'user_role' })
      .notNullable()

    t.timestamp('created_at').notNullable()
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('trip_matches')
};
