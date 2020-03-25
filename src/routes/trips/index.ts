import { Response, Router } from 'express'
import db from '../../db'
import { AuthedReq } from '../../utils/authed_req'
import tripCreation from './new'
import tripDetail from './detail'
/* This whole file has a `requireAuthenticated` on it in routes/index.ts */

const routes = Router()

routes.use('/new', tripCreation)
routes.use('/:tripId/', tripDetail)

routes.get('/', async (req: AuthedReq, res: Response) => {
  try {
    const matchedRequests = await db('trip_requests')
      .join('trip_matches', function() {
        this.on('trip_requests.id', '=', 'trip_matches.driver_request_id')
          .orOn('trip_requests.id', '=', 'trip_matches.rider_request_id')
      }).where({
        'trip_requests.member_id': req.user.id
      }).select(
        'trip_matches.id',
        'trip_requests.role',
        'trip_requests.location_description',
        'trip_requests.direction',
        'trip_matches.date',
        'trip_matches.time',
        'trip_matches.rider_confirmed',
        'trip_matches.driver_confirmed'
      )

    console.log(matchedRequests)

    res.render('trips/index', { matchedRequests })
  } catch (err) {
    res.render('database-error')
  }
})

export default routes
