import knex from 'knex'
import knexfile from '../../knexfile'

/* 
  This file creates the database handle that all other
  files should use when interacting with the database.

  It uses the `knexfile` to configure the database.
*/
export default knex(knexfile.development)
