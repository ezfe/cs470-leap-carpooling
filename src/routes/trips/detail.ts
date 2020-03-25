import { Response, Router } from 'express'
import db from '../../db'
import { AuthedReq } from '../../utils/authed_req'
import { TripMatch } from '../../models/trip_matches'
import { TripRequest } from '../../models/trip_requests'
import { User } from '../../models/users'

const routes = Router({ mergeParams: true })

routes.get('/', async (req: AuthedReq, res: Response) => {
  try {
    const id = parseInt(req.params.tripId, 10)

    const tripMatch = await db('trip_matches').where({ id }).first<TripMatch>()
    if (!tripMatch) {
      res.sendStatus(404)
      return
    }

    const driverRequest = await db('trip_requests').where({ id: tripMatch.driver_request_id }).first<TripRequest>()
    const riderRequest = await db('trip_requests').where({ id: tripMatch.rider_request_id }).first<TripRequest>()
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


export default routes
