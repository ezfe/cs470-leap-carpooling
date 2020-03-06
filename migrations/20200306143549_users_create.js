
exports.up = function(knex) {
  return knex.schema.createTable('users', (t) => {
    t.increments('id').primary().unsigned()
    t.text('netid').notNullable()
    t.text('email')
    t.text('default_location')
    t.integer('deviation_limit')
    t.text('first_name').notNullable()
    t.text('last_name').notNullable()
    t.text('preferred_name')
    t.text('phone_number')
    t.text('profile_image_name')

    t.timestamp('created_at').notNullable()
    t.unique('netid')
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('users')
};
