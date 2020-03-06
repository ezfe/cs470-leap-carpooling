
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
    
    t.date('date').notNullable()
    // defined in times_create, reused here
    t.enu('time', null, { useNative: true, existingType: true, enumName: 'trip_time' })
      .notNullable()
  
    t.boolean('rider_confirmed').notNullable()
    t.boolean('driver_confirmed').notNullable()

    t.timestamp('created_at').notNullable()
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('trip_matches')
};
