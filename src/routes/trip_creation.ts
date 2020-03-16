import { Router, Response } from 'express'
import { AuthedReq } from '../utils/authed_req'
import db from '../db'
import { requireAuthenticated } from '../middleware/auth'

const routes = Router()

// GET /trips/new
routes.get('/', requireAuthenticated, (req: AuthedReq, res: Response) => {
  const googleMapsAPIKey = process.env.GOOGLE_MAPS_PLACES_KEY
  if (!googleMapsAPIKey) {
    res.send('GOOGLE_MAPS_PLACES_KEY is unset')
    return
  }
  res.render('new_trip', { googleMapsAPIKey })
})

// POST /trips/new
routes.post('/', requireAuthenticated, async (req: AuthedReq, res: Response) => {
  try {
    await db('trip_requests').insert({
      member_id: req.user.id,
      role: req.body.user_role,
      location: req.body.place_id,
      deviation_limit: req.body.deviation_limit,
      direction: req.body.direction,
      created_at: db.fn.now()
    })
    res.redirect('/')
  } catch (err) {
    res.render('database-error')
  }
})

export default routes
