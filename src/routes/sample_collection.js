// Get an express router
const routes = require('express').Router()

// Home-page of this route collection
routes.get('/', async (req, res) => {
  res.send('Hi there!')
})

// This file then exports the express router, with
// all the routes added too it
module.exports = routes
