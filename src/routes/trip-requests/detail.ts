import { Response, Router } from 'express'
import db from '../../db'
import { TripMatch } from '../../models/trip_matches'
import { TripRequest } from '../../models/trip_requests'
import { User } from '../../models/users'
import { ReqAuthedReq } from '../../utils/authed_req'
import { sendTripReprocessingEmail } from '../../utils/emails'
import { internalError } from '../errors/internal-error'
import { notFound } from '../errors/not-found'

/**
 * This file is pre-processed by middleware that requires
 * authentication, so all requests may be ReqAuthRequest.
 */

const routes = Router({ mergeParams: true })

/**
 * POST /trip-requests/:requestID/cancel
 *
 * Cancel a trip request with the given ID
 */
routes.post('/cancel', async (req: ReqAuthedReq, res: Response) => {
  try {
    const id = parseInt(req.params.requestID, 10)
    const tripRequest = await db('trip_requests')
      .where({ id })
      .first<TripRequest>()

    // If the user has been matched, notify the other person in the match.
    const tripMatch = await db('trip_matches')
      .where({ driver_request_id: tripRequest.id })
      .orWhere({ rider_request_id: tripRequest.id })
      .first<TripMatch>()

    if (tripMatch) {
      const userRole =
        tripRequest.role == 'driver'
          ? 'trip_matches.rider_request_id'
          : 'trip_matches.driver_request_id'

      const userToNotify = await db('users')
        .where({
          id: (
            await db('trip_requests')
              .select('member_id')
              .join('trip_matches', 'trip_requests.id', userRole)
              .first<TripRequest>()
          ).member_id,
        })
        .first<User>()

      sendTripReprocessingEmail(userToNotify, req.user)
    }

    if (!tripRequest) {
      notFound(req, res)
      return
    }

    await db('trip_requests').where('id', tripRequest.id).del()

    res.redirect('/trips?delete=success')
  } catch (err) {
    console.error(err)
    internalError(req, res, 'internal-error')
  }
})

export default routes
