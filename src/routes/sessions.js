// Get an express router
const routes = require('express').Router()
const db = require('../db')

// Home-page of this route collection
routes.get('/login', async (req, res) => {
  try {
    const users = await db('users')
    res.render('sessions/choose-user', { users })
  } catch (err) {
    res.render('database-error')
  }
})

routes.post('/login', async (req, res) => {
  try {
    const user = await db('users').where({ id: req.body.chosen_user }).first()
    res.send(`Hello ${user.first_name} ${user.last_name}`)
  } catch (err) {
    res.render('database-error')
  }
})

// POST /sessions/create-user
routes.post('/create-user', async (req, res) => {
  try {
    await db('users').insert({
      netid: req.body.netid,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      created_at: db.fn.now()
    })
    res.redirect('/')
  } catch (err) {
    res.render('database-error')
  }
})

// This file then exports the express router, with
// all the routes added too it
module.exports = routes
