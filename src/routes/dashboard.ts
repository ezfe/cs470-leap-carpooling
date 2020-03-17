import { Response, Router } from 'express'
import db from '../db'
import { requireAuthenticated } from '../middleware/auth'
import { TripMatch } from '../models/trip_matches'
import { AuthedReq } from '../utils/authed_req'
import tripCreation from './trip_creation'
import { TripRequest } from '../models/trip_requests'

const routes = Router()

routes.use('/new', tripCreation)

routes.get('/', requireAuthenticated, async (req: AuthedReq, res: Response) => {
  try {
    const matchedRequests = await db('trip_requests')
      .join('trip_matches', function() {
        this.on('trip_requests.id', '=', 'trip_matches.driver_request_id')
          .orOn('trip_requests.id', '=', 'trip_matches.rider_request_id')
      }).where({
        'trip_requests.member_id': req.user.id
      }).select(
        'trip_requests.role',
        'trip_requests.location_description',
        'trip_requests.direction',
        'trip_matches.date',
        'trip_matches.time',
        'trip_matches.rider_confirmed',
        'trip_matches.driver_confirmed'
      )

    console.log(matchedRequests)

    res.render('dashboard', { matchedRequests })
  } catch (err) {
    res.render('database-error')
  }
})

export default routes
