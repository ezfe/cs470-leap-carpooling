
exports.up = function(knex) {
  return knex.raw('ALTER TABLE trip_matches ALTER COLUMN first_portion DROP DEFAULT')
};

exports.down = function(knex) {
  return knex.raw('ALTER TABLE trip_matches ALTER COLUMN first_portion SET DEFAULT \'driver\'')
};
