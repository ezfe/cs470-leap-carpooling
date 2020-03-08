const path = require('path')
const express = require('express')
const routes = express.Router()
const db = require('../db')

const dashboard = require('./dashboard')
const sessions = require('./sessions')
const sampleCollection = require('./sample_collection')

routes.use('/static', express.static(path.join(__dirname, '../../static')))

// All the routes in sample_collection will be
// added inside of /sample-endpoint
routes.use('/sample-endpoint', sampleCollection)
routes.use('/trips', dashboard)

routes.post('/onboard', async(req, res) => {
  try {
    const users = await db('users')
    const currentUser = await getLoggedInUser(req)
   // const records = await db('users')
    // .returning('*')
    // .where ('id','=',currentUser)
    // .update({
    //  preferred_name : req.body.preferred_name,
    //  email : req.body.preferred_email,
    //  phone_number : req.body._phone
   //})
  //  setLoggedInAs(req, records[0])
  //  res.redirect('/')
  res.render('onboard')
  }catch (err) {
    res.render('database-error')
    }
  res.send('Unfinished')
 })

routes.get('/onboard', (req, res) => {
  res.render('onboard')
//   // const prefName = preferred_name
//   // const preEmail = preferred_email
//   // const phone =  _phone


  res.send('Unfinished')
})


routes.use('/sessions', sessions)

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
