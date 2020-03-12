// Get an express router
import { Router } from 'express'
import db from '../db'
import { getUserByID, setLoggedInAs, setLoggedOut, User, getUserByNetID } from '../models/users'
import { AuthedReq } from '../utils/authed_req'

const routes = Router()

// Home-page of this route collection
routes.get('/login', async (req: AuthedReq, res) => {
  try {
    const users = await db<User>('users')
    const currentUser = req.user
    res.render('sessions/choose-user', { users, currentUser })
  } catch (err) {
    res.render('database-error')
  }
})

routes.get('/logout', (req, res) => {
  setLoggedOut(req)
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
    await db<User>('users').insert({
        netid: req.body.netid,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        created_at: db.fn.now()
      })
    const user = await getUserByNetID(req.body.netid)
    setLoggedInAs(req, user)
    res.redirect('/')
  } catch (err) {
    res.render('database-error')
  }
})

export default routes
