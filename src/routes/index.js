const routes = require('express').Router()
const db = require('../db')

const sampleCollection = require('./sample_collection')

// All the routes in sample_collection will be
// added inside of /sample-endpoint
routes.use('/sample-endpoint', sampleCollection)

// This would be the home page
routes.get('/', async (req, res) => {
  // const response = await db.query('SELECT NOW()')
  try {
    const response = await db.raw('SELECT NOW()')
    res.send(JSON.stringify(response.rows[0]))
  } catch (err) {
    console.error(err)
    res.send('An error occurred')
  }
})

module.exports = routes
