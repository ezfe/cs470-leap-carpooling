const routes = require('express').Router()
const db = require('../db')

// /trips/new
routes.get('/', (req, res) => {
  const googleMapsAPIKey = process.env.GOOGLE_MAPS_PLACES_KEY
  if (!googleMapsAPIKey) {
    res.send('GOOGLE_MAPS_PLACES_KEY is unset')
    return
  }
  res.render('new_trip', { googleMapsAPIKey })
})

routes.post('/', (req, res) => {
  res.send(req.body)
})

// POST /sessions/create-user
routes.post('/create-user', async (req, res) => {
  try {
    await db('trip_requests').insert({
      id: req.body.netid,
      member_id: req.body.first_name,
      role: req.body.last_name,
      location: req.body.location,
      deviation_limit: req.body.deviation_limit,
      direction: req.body.direction,
      created_at: db.fn.now()
    })
    res.redirect('/')
  } catch (err) {
    res.render('database-error')
  }
})

module.exports = routes
