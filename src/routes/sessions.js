// Get an express router
const routes = require('express').Router()
const db = require('../db')
const { setLoggedOut, setLoggedInAs, getUserByID } = require('../models/users')

// Home-page of this route collection
routes.get('/login', async (req, res) => {
  try {
    const users = await db('users')
    const currentUser = req.user
    res.render('sessions/choose-user', { users, currentUser })
  } catch (err) {
    res.render('database-error')
  }
})

routes.get('/logout', (req, res) => {
  setLoggedOut(req, null)
  res.redirect('/')
})

routes.post('/login', async (req, res) => {
  const user = await getUserByID(req.body.chosen_user)
  if (user) {
    setLoggedInAs(req, user)
    res.redirect('/')
  } else {
    res.send('User not found')
  }
})

// POST /sessions/create-user
routes.post('/create-user', async (req, res) => {
  try {
    const records = await db('users')
      .returning('*')
      .insert({
        netid: req.body.netid,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        created_at: db.fn.now()
      })
    setLoggedInAs(req, records[0])
    res.redirect('/')
  } catch (err) {
    res.render('database-error')
  }
})

// This file then exports the express router, with
// all the routes added too it
module.exports = routes
