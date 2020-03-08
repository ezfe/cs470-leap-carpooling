const path = require('path')
const express = require('express')
const routes = express.Router()
const { requireAuthenticated } = require('../middleware/auth')

const dashboard = require('./dashboard')
const sessions = require('./sessions')

routes.use('/static', express.static(path.join(__dirname, '../../static')))

routes.use('/trips', dashboard)

routes.get('/onboard', (req, res) => {
  res.render('onboard')
})

routes.post('/onboard', requireAuthenticated, (req, res) => {
  res.send('Unfinished')
})

routes.use('/sessions', sessions)

// This would be the home page
routes.get('/', async (req, res) => {
  res.render('homepage')
})

module.exports = routes
