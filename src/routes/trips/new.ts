import { Response, Router } from 'express'
import db from '../../db'
import sampleJob from '../../jobs/pairing-job'
import { TripRequest } from '../../models/trip_requests'
import { ReqAuthedReq } from '../../utils/authed_req'
import { sendTripProcessingEmail } from '../../utils/emails'
import { geocode } from '../../utils/geocoding'
import { formatLocation } from '../../utils/location_formatter'
import { newTripSchema } from '../../validation/new_trip'
import { internalError } from '../errors/internal-error'

const routes = Router()

// GET /trips/new
routes.get('/', async (req: ReqAuthedReq, res: Response) => {
  const googleMapsAPIKey = process.env.GOOGLE_MAPS_PLACES_KEY
  if (!googleMapsAPIKey) {
    console.error('GOOGLE_MAPS_PLACES_KEY must be set to load the new trips page')
    internalError(req, res, 'google-maps-key')
    return
  }

  const desc = req.user.default_location_description
  let formattedLocation = ''
  if (desc) {
    formattedLocation = await formatLocation(desc, 'full')
  }

  res.render('trips/new', {
    googleMapsAPIKey,
    formattedLocation,
  })
})

// POST /trips/new
routes.post('/', async (req: ReqAuthedReq, res: Response) => {
  try {
    const validated = await newTripSchema.validateAsync(req.body)

    const locationInformation = await geocode(req.body.place_id)
    const locationJSON = JSON.stringify(locationInformation)

    const insertedRequests = await db<TripRequest>('trip_requests')
      .insert({
        member_id: req.user.id,
        role: validated.user_role,
        location: validated.place_id,
        location_description: locationJSON,
        deviation_limit: validated.deviation_limit,
        direction: validated.trip_direction,
        first_date: validated.first_date,
        last_date: validated.last_date,
        created_at: db.fn.now(),
      })
      .returning('*')

    const tripRequest = insertedRequests[0]
    if (req.user.allow_notifications) {
      sendTripProcessingEmail(req.user, tripRequest)
    }

    await sampleJob()

    res.redirect('/trips')
  } catch (err) {
    console.error(err)
    internalError(req, res, 'internal-error')
  }
})

export default routes
