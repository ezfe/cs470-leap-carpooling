const path = require('path')
const express = require('express')
const routes = express.Router()

const db = require('../db')
const { requireAuthenticated } = require('../middleware/auth')

const dashboard = require('./dashboard')
const sessions = require('./sessions')

routes.use('/static', express.static(path.join(__dirname, '../../static')))

routes.use('/trips', dashboard)

routes.post('/onboard', requireAuthenticated, async(req, res) => {
  try {
    await db('users').where({ id: req.user.id })
      .update({
        preferred_name: req.body.preferred_name,
        email: req.body.preferred_email,
        phone_number: req.body._phone
      })

    res.redirect('/')
  } catch (err) {
    console.error(err)
    res.render('database-error')
  }
})

routes.get('/onboard', (req, res) => {
  res.render('onboard')
})

routes.use('/sessions', sessions)

routes.get('/settings', requireAuthenticated, (req, res) => {
  const currentUser = req.user
  const googleMapsAPIKey = process.env.GOOGLE_MAPS_PLACES_KEY
  if (!googleMapsAPIKey) {
    res.send('GOOGLE_MAPS_PLACES_KEY is unset')
    return
  }
  res.render('settings', { currentUser, googleMapsAPIKey })
})

routes.post('/settings/update-user', async (req, res) => {
  try {
    await db('users').where({ id: req.user.id })
      .update({
        preferred_name: req.body.preferred_name,
        email: req.body.preferred_email,
        phone_number: req.body._phone,
        default_location: req.body.plac,
        deviation_limit: req.body.deviation_limit
      })

    res.redirect('/settings')
  } catch (err) {
    res.render('database-error')
  }
})

// This would be the home page
routes.get('/', async (req, res) => {
  res.render('homepage')
})

module.exports = routes
