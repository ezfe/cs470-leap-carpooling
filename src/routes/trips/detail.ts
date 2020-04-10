import { Response, Router } from 'express'
import db from '../../db'
import { TripMatch } from '../../models/trip_matches'
import { TripRequest } from '../../models/trip_requests'
import { getUserByID, User } from '../../models/users'
import { AuthedReq, ReqAuthedReq } from '../../utils/authed_req'
import { PairRejection } from '../../models/pair_rejections'
import { sendTripConfirmationEmail } from '../../utils/emails'

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

    res.render('trips/detail', { tripMatch, driverRequest, riderRequest, driver, rider, otherUser })
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

        sendTripConfirmationEmail(req.user.preferred_name || req.user.first_name, req.user.email!, driverRequest.location_description,
          rider.preferred_name || rider.first_name, riderRequest.location_description, tripMatch.first_date, tripMatch.last_date)
        sendTripConfirmationEmail(rider.preferred_name || rider.first_name, rider.email!, riderRequest.location_description,
          req.user.preferred_name || req.user.first_name, driverRequest.location_description, tripMatch.first_date, tripMatch.last_date)
      }
    } else if (req.user.id === riderRequest.member_id) {
      await db<TripMatch>('trip_matches').update({
        rider_confirmed: true
      }).where('id', tripMatch.id)

      if (tripMatch.driver_confirmed) {
        const driver = await db('users').where({ id: driverRequest.member_id }).first<User>()

        sendTripConfirmationEmail(req.user.preferred_name || req.user.first_name, req.user.email!, riderRequest.location_description, 
          driver.preferred_name || driver.first_name, driverRequest.location_description, tripMatch.first_date, tripMatch.last_date)
        sendTripConfirmationEmail(driver.preferred_name || driver.first_name, driver.email!, driverRequest.location_description,
          req.user.preferred_name || req.user.first_name, riderRequest.location_description, tripMatch.first_date, tripMatch.last_date)
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
