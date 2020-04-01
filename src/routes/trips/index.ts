import { Response, Router } from 'express'
import db from '../../db'
import { getTripMatches } from '../../models/trip_matches'
import { ReqAuthedReq } from '../../utils/authed_req'
import tripDetail from './detail'
import tripCreation from './new'

/* This whole file has a `requireAuthenticated` on it in routes/index.ts */

const routes = Router()

routes.use('/new', tripCreation)
routes.use('/:tripId/', tripDetail)

routes.get('/', async (req: ReqAuthedReq, res: Response) => {
  try {
    console.log(req.query.delete === 'success')
    const alerts = { delete: req.query.delete === 'success'  }

    const matchedRequests = await getTripMatches(req.user)
    console.log('Found matched requests')
    console.log(matchedRequests)

    let unmatchedRequests = await db('trip_requests')
      .select(
        'trip_requests.role',
        db.ref('trip_requests.id').as('trip_request_id'),
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

    // will add time annotations elsewhere
    // matchedRequests = await Promise.all(matchedRequests.map(annotateRequests))
    unmatchedRequests = await Promise.all(unmatchedRequests.map(annotateRequests))

    const context = { matchedRequests, unmatchedRequests, alerts }
    console.log(context)

    res.render('trips/index', context)
  } catch (err) {
    console.error(err)
    res.render('database-error')
  }
})

export default routes
