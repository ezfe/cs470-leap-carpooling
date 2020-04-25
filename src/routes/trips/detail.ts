import { Response, Router } from 'express'
import db from '../../db'
import { PairRejection } from '../../models/pair_rejections'
import { TripMatch } from '../../models/trip_matches'
import { TripRequest } from '../../models/trip_requests'
import { User } from '../../models/users'
import { AuthedReq, ReqAuthedReq } from '../../utils/authed_req'
import { sendTripConfirmationEmail } from '../../utils/emails'
import { lafayettePlaceID } from '../../utils/places'
import { locationCity } from '../../utils/geocoding'
import { geocode } from '../../utils/geocoding'
//import { geocode } from '@googlemaps/google-maps-services-js/dist/geocode/geocode'

/* This whole file has a `requireAuthenticated` on it in routes/index.ts */

const routes = Router({ mergeParams: true })

async function preprocess(req: AuthedReq): Promise<{ tripMatch: TripMatch, driverRequest: TripRequest, riderRequest: TripRequest } | null> {
  const id = parseInt(req.params.tripId, 10)

  const tripMatch = await db('trip_matches').where({ id }).first<TripMatch>()
  if (!tripMatch) {
    return null
  }

  const driverRequest = await db('trip_requests').where({ id: tripMatch.driver_request_id }).first<TripRequest>()
  const riderRequest = await db('trip_requests').where({ id: tripMatch.rider_request_id }).first<TripRequest>()

  return { tripMatch, driverRequest, riderRequest }
}

routes.get('/', async (req: ReqAuthedReq, res: Response) => {
  try {
    const googleMapsAPIKey = process.env.GOOGLE_MAPS_PLACES_KEY
    if (!googleMapsAPIKey) {
      res.send('GOOGLE_MAPS_PLACES_KEY is unset')
      return
    }

    const processed = await preprocess(req)
    if (!processed) {
      res.sendStatus(404)
      return
    }
    const { tripMatch, driverRequest, riderRequest } = processed

    const driver = await db('users').where({ id: driverRequest.member_id }).first<User>()
    const rider = await db('users').where({ id: riderRequest.member_id }).first<User>()
    if (!driver || !rider) {
      console.error(`The driver ${JSON.stringify(driverRequest)} or rider ${JSON.stringify(riderRequest)} requests has invalid members?`)
      res.sendStatus(510)
      return
    }

    const otherUser = driver.id === req.user.id ? rider : driver
    const driverProfileImageURL = driver.profile_image_name || 'static/blank-profile.png'
    const riderProfileImageURL = rider.profile_image_name || 'static/blank-profile.png'

    let firstPlaceID: string | null = null
    let midPlaceID: string | null = null
    let lastPlaceID: string | null = null
    geocode(lafayettePlaceID)
    if (driverRequest.direction === 'from_lafayette') {
      firstPlaceID = lafayettePlaceID
      if (tripMatch.first_portion === 'driver') {
       
        midPlaceID = riderRequest.location
        console.log( locationCity(midPlaceID));
        lastPlaceID = driverRequest.location
      } else if (tripMatch.first_portion === 'rider') {
        midPlaceID = driverRequest.location
        lastPlaceID = riderRequest.location
        console.log( locationCity(midPlaceID));
      }
    } else if (driverRequest.direction === 'towards_lafayette') {
      lastPlaceID = lafayettePlaceID
      if (tripMatch.first_portion === 'driver') {
        firstPlaceID = riderRequest.location
        midPlaceID = driverRequest.location
        console.log( locationCity(midPlaceID));
      } else if (tripMatch.first_portion === 'rider') {
        firstPlaceID = driverRequest.location
        midPlaceID = riderRequest.location
        console.log( locationCity(midPlaceID));
      }
    }

    if (!firstPlaceID || !midPlaceID || !lastPlaceID) {
      console.error('Unable to find all place IDs!')
      res.send('An error occurred generating place IDs')
      return
    }

    // eslint-disable-next-line no-inner-declarations
    function descriptionFor(placeID) {
      return (driverRequest.location === placeID) ? driverRequest.location_description : ((riderRequest.location === placeID) ? riderRequest.location_description : 'Lafayette College')
    }

    const firstPlaceDescription = descriptionFor(firstPlaceID)
    const midPlaceDescription = descriptionFor(midPlaceID)
    const lastPlaceDescription = descriptionFor(lastPlaceID)

    res.render('trips/detail', {
      tripMatch,
      driverRequest,
      riderRequest,
      driver,
      rider,
      otherUser,
      firstPlaceID,
      lastPlaceID,
      midPlaceID,
      firstPlaceDescription,
      midPlaceDescription,
      lastPlaceDescription,
      driverProfileImageURL,
      riderProfileImageURL,
      googleMapsAPIKey
    })
  } catch (err) {
    console.error(err)
    res.render('database-error')
  }
})

routes.post('/confirm', async (req: ReqAuthedReq, res: Response) => {
  try {
    const processed = await preprocess(req)
    if (!processed) {
      res.sendStatus(404)
      return
    }
    const { tripMatch, driverRequest, riderRequest } = processed

    if (req.user.id === driverRequest.member_id) {
      await db<TripMatch>('trip_matches').update({
        driver_confirmed: true
      }).where('id', tripMatch.id)

      if (tripMatch.rider_confirmed) {
        const rider = await db('users').where({ id: riderRequest.member_id }).first<User>()

        if (req.user.allow_notifications) {
          sendTripConfirmationEmail(
            req.user,
            rider,
            tripMatch,
            riderRequest,
            driverRequest
          )
        }
        if (rider.allow_notifications) {
          sendTripConfirmationEmail(
            rider,
            req.user,
            tripMatch,
            riderRequest,
            driverRequest
          )
        }
      }
    } else if (req.user.id === riderRequest.member_id) {
      await db<TripMatch>('trip_matches').update({
        rider_confirmed: true
      }).where('id', tripMatch.id)

      if (tripMatch.driver_confirmed) {
        const driver = await db('users').where({ id: driverRequest.member_id }).first<User>()

        if (req.user.allow_notifications) {
          sendTripConfirmationEmail(
            req.user,
            driver,
            tripMatch,
            riderRequest,
            driverRequest
          )
        }
        if (driver.allow_notifications) {
          sendTripConfirmationEmail(
            driver,
            req.user,
            tripMatch,
            riderRequest,
            driverRequest
          )
        }
      }
    } else {
      console.error('Forbidden to confirm trip when not a member of the trip')
      res.sendStatus(403)
      return
    }

    res.redirect(`/trips/${tripMatch.id}`)
    return
  } catch (err) {
    console.error(err)
    res.render('database-error')
  }
})

routes.post('/reject', async (req: ReqAuthedReq, res: Response) => {
  const processed = await preprocess(req)
  if (!processed) {
    res.sendStatus(404)
    return
  }
  const { tripMatch, driverRequest, riderRequest } = processed

  let myRequest: TripRequest | null = null
  let otherRequest: TripRequest | null = null

  if (driverRequest.member_id === req.user.id) {
    myRequest = driverRequest
    otherRequest = riderRequest
  } else if (riderRequest.member_id === req.user.id) {
    myRequest = riderRequest
    otherRequest = driverRequest
  } else {
    console.error('Forbidden to reject trip when not a member of the trip')
    res.sendStatus(403)
    return
  }

  const reasons = ['incompatible-location', 'incompatible-times', 'block-person']
  const requestedReason = req.body.blockReason
  if (reasons.indexOf(requestedReason) < 0) {
    console.error(`Forbidden block reason: ${requestedReason}`)
    res.sendStatus(403)
    return
  }

  await db<PairRejection>('pair_rejections').insert({
    blocker_id: myRequest.member_id,
    blockee_id: otherRequest.member_id
  })
  await db<TripMatch>('trip_matches').where({ id: tripMatch.id }).del()

  res.redirect('/trips?reject=success')
  return
})

export default routes
