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
    // currentUser should be guarunteed when requireAuthenticated is run
    const currentUser = req.user.id
    console.error(currentUser)
    await db('users').where('id', '=', currentUser)
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
  res.send('Unfinished')
})

routes.use('/sessions', sessions)

// This would be the home page
routes.get('/', async (req, res) => {
  res.render('homepage')
})

module.exports = routes
