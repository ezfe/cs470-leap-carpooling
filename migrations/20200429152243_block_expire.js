exports.up = function(knex) {
  return knex.schema.table('pair_rejections', table => {
    table.date('expire_after')
  })
};

exports.down = function(knex) {
  return knex.schema.table('pair_rejections', table => {
    table.dropColumn('expire_after')
  })
};
