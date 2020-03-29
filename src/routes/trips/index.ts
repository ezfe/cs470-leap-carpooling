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
    let matchedRequests = await db('trip_requests')
      .select(
        'trip_matches.id',
        db.ref('trip_requests.id').as('trip_request_id'),
        'trip_requests.role',
        'trip_requests.location_description',
        'trip_requests.direction',
        'trip_matches.date',
        'trip_matches.time',
        'trip_matches.rider_confirmed',
        'trip_matches.driver_confirmed'
      ).join('trip_matches', function() {
        this.on('trip_requests.id', '=', 'trip_matches.driver_request_id')
          .orOn('trip_requests.id', '=', 'trip_matches.rider_request_id')
      }).where({
        'trip_requests.member_id': req.user?.id
      })

    let unmatchedRequests = await db('trip_requests')
      .select(
        'trip_requests.role',
        'trip_requests.location_description',
        'trip_requests.direction'
      ).leftJoin('trip_matches', function() {
        this.on('trip_requests.id', '=', 'trip_matches.driver_request_id')
          .orOn('trip_requests.id', '=', 'trip_matches.rider_request_id')
      }).whereNull('trip_matches.id').andWhere('trip_requests.member_id', req.user?.id)

    async function annotateRequests(request) {
      const times = await db('trip_times').select('*').where('request_id', request.trip_request_id)
      return {
        ...request,
        times
      }
    }

    matchedRequests = await Promise.all(matchedRequests.map(annotateRequests))
    unmatchedRequests = await Promise.all(unmatchedRequests.map(annotateRequests))

    const context = { matchedRequests, unmatchedRequests }
    console.log(context)

    res.render('trips/index', context)
  } catch (err) {
    res.render('database-error')
  }
})

export default routes
