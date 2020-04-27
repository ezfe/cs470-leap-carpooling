import { Response, Router } from 'express'
import db from '../../db'
import { getTripMatches } from '../../models/trip_matches'
import { TripRequest } from '../../models/trip_requests'
import { ReqAuthedReq } from '../../utils/authed_req'
import tripDetail from './detail'
import tripCreation from './new'
import { formatLocation } from '../../utils/location_formatter'
import { internalError } from '../errors/internal-error'

/* This whole file has a `requireAuthenticated` on it in routes/index.ts */

const routes = Router()

routes.use('/new', tripCreation)
routes.use('/:tripId/', tripDetail)

/**
 * GET /trips
 *
 * The main list of trips the user is a member of
 */
routes.get('/', async (req: ReqAuthedReq, res: Response) => {
  try {
    const alerts = {
      delete: req.query.delete === 'success',
      reject: req.query.reject === 'success'
    }

    const pastMatchedRequests = await getTripMatches(req.user, "past", null)
    const futureActionNotNeeded = await getTripMatches(req.user, "future", false)
    const futureActionNeeded = await getTripMatches(req.user, "future", true)

    const unmatchedRequests: TripRequest[] = await db('trip_requests')
      .select(
        'trip_requests.*'
      ).leftJoin('trip_matches', function() {
        this.on('trip_requests.id', '=', 'trip_matches.driver_request_id')
          .orOn('trip_requests.id', '=', 'trip_matches.rider_request_id')
      }).whereNull('trip_matches.id')
      .andWhere('trip_requests.member_id', req.user.id)

    const trips = [
      ...futureActionNeeded,
      ...futureActionNotNeeded,
      ...unmatchedRequests,
      ...pastMatchedRequests
    ]

    res.locals.formatLocation = formatLocation
    res.render('trips/index', { trips, alerts,  })
  } catch (err) {
    console.error(err)
    internalError(req, res, 'internal-error')
  }
})

export default routes
