// Get an express router
const routes = require('express').Router()
const db = require('../db')

// Home-page of this route collection
routes.get('/', async (req, res) => {
  const samples = await db('sample_table')
  res.render('sample-endpoint', { samples })
})

routes.get('/add', async (req, res) => {
  await db('sample_table').insert({
    string_field: 'sample text',
    created_at: db.fn.now()
  })

  res.redirect('/sample-endpoint')
})

// This file then exports the express router, with
// all the routes added too it
module.exports = routes
