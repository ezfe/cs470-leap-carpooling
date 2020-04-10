import { Response, Router } from 'express'
import db from '../../db'
import { TripMatch } from '../../models/trip_matches'
import { TripRequest } from '../../models/trip_requests'
import { getUserByID, User } from '../../models/users'
import { AuthedReq, ReqAuthedReq } from '../../utils/authed_req'
import { PairRejection } from '../../models/pair_rejections'

/* This whole file has a `requireAuthenticated` on it in routes/index.ts */

const routes = Router({ mergeParams: true })

const nodemailer = require('nodemailer')
const transporter = nodemailer.createTransport({
  service: 'SendInBlue',
  auth: {
    user: 'leaplifts@gmail.com',
    pass: 'qW4NAZ6TKaSdBsMJ'
  }
});

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
        sendConfirmationEmail(req.user, rider)
        sendConfirmationEmail(rider, req.user)
      }
    } else if (req.user.id === riderRequest.member_id) {
      await db<TripMatch>('trip_matches').update({
        rider_confirmed: true
      }).where('id', tripMatch.id)

      if (tripMatch.driver_confirmed) {
        const driver = await db('users').where({ id: driverRequest.member_id }).first<User>()
        sendConfirmationEmail(req.user, driver)
        sendConfirmationEmail(driver, req.user)
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

async function sendConfirmationEmail(user, passenger) {
  await transporter.sendMail({
    from: '"LEAP Lifts" <leaplifts@gmail.com>',
    to: user.email,
    subject: "Trip Confirmation",
    html: `Hello ${user.preferredName}, <br> Both you and ${passenger.preferredName} have confirmed your trip.
          At this point, please contact your match and decide on a departure time and location! <br> The LEAP Lifts Team`
  });
}

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
