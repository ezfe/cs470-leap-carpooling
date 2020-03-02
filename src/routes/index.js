const path = require('path')
const express = require('express')
const routes = express.Router()
// const db = require('../db')

const dashboard = require('./dashboard')
const sampleCollection = require('./sample_collection')

routes.use('/static', express.static(path.join(__dirname, '../../static')))

// All the routes in sample_collection will be
// added inside of /sample-endpoint
routes.use('/sample-endpoint', sampleCollection)
routes.use('/trips', dashboard)

// This would be the home page
routes.get('/', async (req, res) => {
  res.render('homepage')
  // try {
  //   const response = await db.raw('SELECT NOW()')
  //   const row0 = response.rows[0]
  //   const now = row0.now
  //   res.render('index', { now })
  // } catch (err) {
  //   res.render('database-error')
  // }
})

module.exports = routes
