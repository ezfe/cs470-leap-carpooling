import { Response, Router } from 'express'
import db from '../../db'
import { getTripMatches } from '../../models/trip_matches'
import { ReqAuthedReq } from '../../utils/authed_req'
import tripDetail from './detail'
import tripCreation from './new'
import { TripRequest } from '../../models/trip_requests'


/* This whole file has a `requireAuthenticated` on it in routes/index.ts */

const routes = Router()

routes.use('/new', tripCreation)
routes.use('/:tripId/', tripDetail)


routes.get('/', async (req: ReqAuthedReq, res: Response) => {
  try {
    const alerts = {
      delete: req.query.delete === 'success',
      reject: req.query.reject === 'success'
    }

    const matchedRequests = await getTripMatches(req.user)
    console.log('Found matched requests')
    console.log(matchedRequests)

    const unmatchedRequests: TripRequest[] = await db('trip_requests')
      .select(
        'trip_requests.*'
      ).leftJoin('trip_matches', function() {
        this.on('trip_requests.id', '=', 'trip_matches.driver_request_id')
          .orOn('trip_requests.id', '=', 'trip_matches.rider_request_id')
      }).whereNull('trip_matches.id')
      .andWhere('trip_requests.member_id', req.user.id)

    const context = { matchedRequests, unmatchedRequests, alerts }
    console.log(context)

    res.render('trips/index', context)
  } catch (err) {
    console.error(err)
    res.render('database-error')
  }
})

export default routes
