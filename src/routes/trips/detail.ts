import { Response, Router } from 'express'
import db from '../../db'
import { TripMatch } from '../../models/trip_matches'
import { TripRequest } from '../../models/trip_requests'
import { getUserByID, User } from '../../models/users'
import { AuthedReq, ReqAuthedReq } from '../../utils/authed_req'

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
    } else if (req.user.id === riderRequest.member_id) {
      await db<TripMatch>('trip_matches').update({
        rider_confirmed: true
      }).where('id', tripMatch.id)
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

routes.get('/reject', async (req: ReqAuthedReq, res: Response) => {
  const processed = await preprocess(req)
  if (!processed) {
    res.sendStatus(404)
    return
  }
  const { driverRequest, riderRequest } = processed

  if (driverRequest.member_id === req.user.id || riderRequest.member_id === req.user.id) {
    const otherMemberID = (driverRequest.member_id === req.user.id) ? riderRequest.member_id : driverRequest.member_id

    const otherUser = await getUserByID(otherMemberID)
    if (!otherUser) {
      console.error(`Unable to find user ${otherMemberID}`)
      res.sendStatus(500)
      return
    }

    res.render('trips/reject', { otherUser })
    return
  } else {
    console.error('Forbidden to reject trip when not a member of the trip')
    res.sendStatus(403)
    return
  }
})

export default routes
