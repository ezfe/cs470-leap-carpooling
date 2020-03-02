const routes = require('express').Router()

// /trips/new
routes.get('/', (req, res) => {
  res.render('new_trip')
})

module.exports = routes
