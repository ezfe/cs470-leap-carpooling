import { Router, static as expressStatic, Request, Response } from 'express'
import path from 'path'
import db from '../db'
import { requireAuthenticated } from '../middleware/auth'
import dashboard from './dashboard'
import sessions from './sessions'
import { User } from '../models/users'
import { AuthedReq } from '../utils/authed_req'

const routes = Router()

routes.use('/static', expressStatic(path.join(__dirname, '../../static')))

routes.use('/trips', dashboard)

routes.post('/onboard', requireAuthenticated, async (req: AuthedReq, res: Response) => {
  try {
    await db<User>('users').where({ id: req.user.id })
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

routes.get('/onboard', (req: AuthedReq, res: Response) => {
  res.render('onboard')
})

routes.use('/sessions', sessions)

routes.get('/settings', requireAuthenticated, (req: AuthedReq, res) => {
  const currentUser = req.user
  const googleMapsAPIKey = process.env.GOOGLE_MAPS_PLACES_KEY
  if (!googleMapsAPIKey) {
    res.send('GOOGLE_MAPS_PLACES_KEY is unset')
    return
  }
  res.render('settings', { currentUser, googleMapsAPIKey })
})

routes.post('/settings/update-user', async (req: AuthedReq, res: Response) => {
  try {
    await db('users').where({ id: req.user.id })
      .update({
        preferred_name: req.body.preferred_name,
        email: req.body.preferred_email,
        phone_number: req.body._phone,
        default_location: req.body.place_id,
        deviation_limit: req.body.deviation_limit
      })

    res.redirect('/settings')
  } catch (err) {
    res.render('database-error')
  }
})

// This would be the home page
routes.get('/', async (req: AuthedReq, res: Response) => {
  res.render('homepage')
})

export default routes