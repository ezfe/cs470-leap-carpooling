import { Response, Router } from 'express'
import db from '../../db'
import { TripMatch } from '../../models/trip_matches'
import { TripRequest } from '../../models/trip_requests'
import { User } from '../../models/users'
import { ReqAuthedReq } from '../../utils/authed_req'

const routes = Router({ mergeParams: true })

const nodemailer = require('nodemailer')
const transporter = nodemailer.createTransport({
  service: 'SendInBlue',
  auth: {
    user: 'leaplifts@gmail.com',
    pass: 'qW4NAZ6TKaSdBsMJ'
  }
});

async function preprocess(req: ReqAuthedReq): Promise<{ tripMatch?: TripMatch, driverRequest?: TripRequest, riderRequest?: TripRequest }> {
  const id = parseInt(req.params.tripId, 10)

  const tripMatch = await db('trip_matches').where({ id }).first<TripMatch>()
  if (!tripMatch) {
    return {}
  }

  const driverRequest = await db('trip_requests').where({ id: tripMatch.driver_request_id }).first<TripRequest>()
  const riderRequest = await db('trip_requests').where({ id: tripMatch.rider_request_id }).first<TripRequest>()
  if (!driverRequest || !riderRequest) {
    return { tripMatch, driverRequest, riderRequest }
  }

  return { tripMatch, driverRequest, riderRequest }
}

routes.get('/', async (req: ReqAuthedReq, res: Response) => {
  try {
    const { tripMatch, driverRequest, riderRequest } = await preprocess(req)

    if (!tripMatch) {
      res.sendStatus(404)
      return
    }

    if (!driverRequest || !riderRequest) {
      console.error(`The trip match ${JSON.stringify(tripMatch)} has invalid requests?`)
      res.sendStatus(510)
      return
    }

    const driver = await db('users').where({ id: driverRequest.member_id }).first<User>()
    const rider = await db('users').where({ id: riderRequest.member_id }).first<User>()
    if (!driver || !rider) {
      console.error(`The driver ${JSON.stringify(driverRequest)} or rider ${JSON.stringify(riderRequest)} requests has invalid members?`)
      res.sendStatus(510)
      return
    }

    res.render('trips/detail', { tripMatch, driverRequest, riderRequest, driver, rider })
  } catch (err) {
    console.error(err)
    res.render('database-error')
  }
})

routes.post('/confirm', async (req: ReqAuthedReq, res: Response) => {
  try {
    const { tripMatch, driverRequest, riderRequest } = await preprocess(req)

    if (!tripMatch) {
      res.sendStatus(404)
      return
    }

    if (!driverRequest || !riderRequest) {
      console.error(`The trip match ${JSON.stringify(tripMatch)} has invalid requests?`)
      res.sendStatus(510)
      return
    }

    if (req.user?.id === driverRequest.member_id) {
      await db<TripMatch>('trip_matches').update({
        driver_confirmed: true
      }).where('id', tripMatch.id)

      if (tripMatch.rider_confirmed) {
        const rider = await db('users').where({ id: riderRequest.member_id }).first<User>()
        sendConfirmationEmail(req.user, rider)
        sendConfirmationEmail(rider, req.user)
      }
    } else if (req.user?.id === riderRequest.member_id) {
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

export default routes
