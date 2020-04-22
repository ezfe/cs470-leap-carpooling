import { Response, Router } from 'express'
import db from '../../db'
import { getTripMatches } from '../../models/trip_matches'
import { TripRequest } from '../../models/trip_requests'
import { ReqAuthedReq } from '../../utils/authed_req'
import tripDetail from './detail'
import tripCreation from './new'


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

    const pastMatchedRequests = await getTripMatches(req.user, "past")
    const futureMatchedRequests = await getTripMatches(req.user, "future")
    console.log('Found past matched requests')
    console.log(pastMatchedRequests)
    console.log('Found future matched requests')
    console.log(futureMatchedRequests)

    const unmatchedRequests: TripRequest[] = await db('trip_requests')
      .select(
        'trip_requests.*'
      ).leftJoin('trip_matches', function() {
        this.on('trip_requests.id', '=', 'trip_matches.driver_request_id')
          .orOn('trip_requests.id', '=', 'trip_matches.rider_request_id')
      }).whereNull('trip_matches.id')
      .andWhere('trip_requests.member_id', req.user.id)

    const context = { pastMatchedRequests, futureMatchedRequests, unmatchedRequests, alerts }
    console.log(context)

    res.render('trips/index', context)
  } catch (err) {
    console.error(err)
    res.render('database-error')
  }
})

export default routes
