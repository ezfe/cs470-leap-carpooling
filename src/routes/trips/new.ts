import { Response, Router } from 'express'
import db from '../../db'
import sampleJob from '../../jobs/pairing-job'
import { TripRequest } from '../../models/trip_requests'
import { AuthedReq, ReqAuthedReq } from '../../utils/authed_req'
import { sendTripProcessingEmail } from '../../utils/emails'
import { locationCity } from '../../utils/geocoding'

const routes = Router()

// GET /trips/new
routes.get('/', (req: AuthedReq, res: Response) => {
  const googleMapsAPIKey = process.env.GOOGLE_MAPS_PLACES_KEY
  if (!googleMapsAPIKey) {
    res.send('GOOGLE_MAPS_PLACES_KEY is unset')
    return
  }

  res.render('trips/new', {
    googleMapsAPIKey
  })
})

// POST /trips/new
routes.post('/', async (req: ReqAuthedReq, res: Response) => {
  try {
    const deviationLimitString = req.body.deviation_limit
    const deviationLimit = parseInt(deviationLimitString, 10)
    console.log(deviationLimit)
    const temp =await(locationCity(req.body.place_id))
    console.log(temp)
    const locDict = JSON.stringify(temp)
    console.log("***************this is what will be inserted into the db **************************")
    console.log(locDict)
    console.log("***************************************************************")
    

    const requests = await db<TripRequest>('trip_requests').insert({
        member_id: req.user?.id,
        role: req.body.user_role,
        location: req.body.place_id,
        location_description: locDict,
        deviation_limit: deviationLimit,
        direction: req.body.trip_direction,
        first_date: req.body.first_date,
        last_date: req.body.last_date,
        created_at: db.fn.now()
      }).returning("*")
    
    const tripRequest = requests[0]
    if (req.user.allow_notifications) {
      sendTripProcessingEmail(req.user, tripRequest)
    }

    await sampleJob()

    res.redirect('/trips')
  } catch (err) {
    console.error(err)
    res.render('database-error')
  }
})

export default routes
