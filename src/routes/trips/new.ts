import { Response, Router } from 'express'
import db from '../../db'
import { TripRequest } from '../../models/trip_requests'
import { AuthedReq } from '../../utils/authed_req'
import moment from 'moment'


const routes = Router()

// GET /trips/new
routes.get('/', (req: AuthedReq, res: Response) => {
  const googleMapsAPIKey = process.env.GOOGLE_MAPS_PLACES_KEY
  if (!googleMapsAPIKey) {
    res.send('GOOGLE_MAPS_PLACES_KEY is unset')
    return
  }

  const defaultDeviationLimit = req.user?.deviation_limit

  res.render('trips/new', {
    googleMapsAPIKey,
    defaultDeviationLimit
  })
})

// POST /trips/new
routes.post('/', async (req: AuthedReq, res: Response) => {
  try {
    const deviationLimitString = req.body.deviation_limit
    const deviationLimit = parseInt(deviationLimitString, 10)
    console.log(deviationLimit)

    await db<TripRequest>('trip_requests').insert({
        member_id: req.user?.id,
        role: req.body.user_role,
        location: req.body.place_id,
        location_description: req.body.location_description,
        deviation_limit: deviationLimit,
        direction: req.body.trip_direction,
        first_date: req.body.first_date,
        last_date: req.body.last_date,
        created_at: db.fn.now()
      })

    res.redirect('/trips')
  } catch (err) {
    console.error(err)
    res.render('database-error')
  }
})

export default routes
