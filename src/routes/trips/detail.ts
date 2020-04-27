import { NextFunction, Response, Router } from 'express'
import db from '../../db'
import { PairRejection } from '../../models/pair_rejections'
import { TripMatch } from '../../models/trip_matches'
import { TripRequest } from '../../models/trip_requests'
import { getPreferredFirstName, User } from '../../models/users'
import { ReqAuthedReq } from '../../utils/authed_req'
import { sendTripConfirmationEmail } from '../../utils/emails'
import {
  formatLocation
} from '../../utils/location_formatter'
import { lafayettePlaceID } from '../../utils/places'
import { notFound } from '../errors/not-found'
import { internalError } from '../errors/internal-error'

/* This whole file has a `requireAuthenticated` on it in routes/index.ts */

const routes = Router({ mergeParams: true })

interface MatchRequest extends ReqAuthedReq {
  tripMatch: TripMatch
  driver: User
  driverRequest: TripRequest
  rider: User
  riderRequest: TripRequest
  otherUser: User
  otherUserRequest: TripRequest
  currentUserRequest: TripRequest
  isDriver: boolean
}

// Middleware for just this file's routes
routes.use(async (req: MatchRequest, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.tripId, 10)

    const tripMatch = await db('trip_matches').where({ id }).first<TripMatch>()
    if (!tripMatch) {
      notFound(req, res)
      return
    }
    req.tripMatch = tripMatch

    const driverRequest = await db('trip_requests')
      .where({ id: tripMatch.driver_request_id })
      .first<TripRequest>()
    const riderRequest = await db('trip_requests')
      .where({ id: tripMatch.rider_request_id })
      .first<TripRequest>()
    if (!driverRequest || !riderRequest) {
      console.error('Failed to retrieve requests from a match')
      console.error('This might indicate database issues')
      internalError(req, res, 'internal-error')
      return
    }
    req.driverRequest = driverRequest
    req.riderRequest = riderRequest

    if (req.driverRequest.member_id == req.user.id) {
      req.isDriver = true
    } else if (req.riderRequest.member_id == req.user.id) {
      req.isDriver = false
    } else {
      res.sendStatus(403)
      return
    }

    const driver = await db('users')
      .where({ id: driverRequest.member_id })
      .first<User>()
    const rider = await db('users')
      .where({ id: riderRequest.member_id })
      .first<User>()
    if (!driver || !rider) {
      console.error(
        `The driver ${JSON.stringify(driverRequest)} or rider ${JSON.stringify(
          riderRequest
        )} requests has invalid members?`
      )
      internalError(req, res, 'internal-error')
      return
    }
    req.driver = driver
    req.rider = rider

    req.otherUser = req.isDriver ? rider : driver
    req.otherUserRequest = req.isDriver ? riderRequest : driverRequest
    req.currentUserRequest = req.isDriver ? driverRequest : riderRequest

    res.locals.getPreferredFirstName = getPreferredFirstName

    next()
  } catch (err) {
    console.error(err)
    internalError(req, res, "internal-error")
  }
})

routes.get('/', async (req: MatchRequest, res: Response) => {
  try {
    const googleMapsAPIKey = process.env.GOOGLE_MAPS_BROWSER_KEY
    if (!googleMapsAPIKey) {
      console.error('GOOGLE_MAPS_BROWSER_KEY is unset, so trip map won\'t appear')
    }

    const driverProfileImageURL =
      req.driver.profile_image_name || 'static/blank-profile.png'
    const riderProfileImageURL =
      req.rider.profile_image_name || 'static/blank-profile.png'

    let firstPlaceID: string | null = null
    let midPlaceID: string | null = null
    let lastPlaceID: string | null = null

    if (req.driverRequest.direction === 'from_lafayette') {
      firstPlaceID = lafayettePlaceID
      if (req.tripMatch.first_portion === 'driver') {
        midPlaceID = req.riderRequest.location
        lastPlaceID = req.driverRequest.location
      } else if (req.tripMatch.first_portion === 'rider') {
        midPlaceID = req.driverRequest.location
        lastPlaceID = req.riderRequest.location
      }
    } else if (req.driverRequest.direction === 'towards_lafayette') {
      lastPlaceID = lafayettePlaceID
      if (req.tripMatch.first_portion === 'driver') {
        firstPlaceID = req.driverRequest.location
        midPlaceID = req.riderRequest.location
      } else if (req.tripMatch.first_portion === 'rider') {
        firstPlaceID = req.riderRequest.location
        midPlaceID = req.driverRequest.location
      }
    }

    if (!firstPlaceID || !midPlaceID || !lastPlaceID) {
      console.error('Unable to find all place IDs!')
      internalError(req, res, 'internal-error')
      return
    }

    // eslint-disable-next-line no-inner-declarations
    function descriptionFor(placeID) {
      if (req.driverRequest.location === placeID) {
        return req.driverRequest.location_description
      } else if (req.riderRequest.location === placeID) {
        return req.riderRequest.location_description
      } else {
        return 'Lafayette College'
      }
    }
    let firstPlaceDescription = ''
    let lastPlaceDescription = ''
  
    let changeRider = false
    let changeDriver = false
    //if(req.driverRequest.location!=req.riderRequest.location){
    if (firstPlaceID === lafayettePlaceID) {
      firstPlaceDescription = descriptionFor(firstPlaceID)
    } else {
      if (
        (req.isDriver &&
        firstPlaceID == req.riderRequest.location) &&
        (req.driverRequest.location!=req.riderRequest.location)
      ) {
        changeRider = true
        firstPlaceDescription = await formatLocation(
          descriptionFor(firstPlaceID),
          'city'
        )
      } else if (
        (!req.isDriver &&
        firstPlaceID == req.driverRequest.location) &&
        (req.driverRequest.location!=req.riderRequest.location)
      ) {
        changeDriver = true
        firstPlaceDescription = await formatLocation(
          descriptionFor(firstPlaceID),
          'city'
        )
      } else {
        firstPlaceDescription = await formatLocation(
          descriptionFor(firstPlaceID),
          'full'
        )
      }
    }
  //}

    const midPlaceDescription = await formatLocation(
      descriptionFor(midPlaceID),
      'full'
    )

    if (lastPlaceID === lafayettePlaceID) {
      lastPlaceDescription = descriptionFor(lastPlaceID)
    } else {
      if ((req.isDriver && lastPlaceID == req.riderRequest.location)&&
      (req.driverRequest.location!=req.riderRequest.location)) {
        changeRider = true
        lastPlaceDescription = await formatLocation(descriptionFor(lastPlaceID), 'city')
      } else if ((!req.isDriver && lastPlaceID == req.driverRequest.location)&&
        (req.driverRequest.location!=req.riderRequest.location)) {
        changeDriver = true
        lastPlaceDescription = await formatLocation(descriptionFor(lastPlaceID), 'city')
      } else {
        lastPlaceDescription = await formatLocation(
          descriptionFor(lastPlaceID),
          'full'
        )
      }
    }
    let otherLoc =""
    if(changeRider ==true || changeDriver == true)
    {
      otherLoc = formatLocation(req.otherUserRequest.location_description,'city')
    }
    else{
      otherLoc = formatLocation(req.otherUserRequest.location_description,'full')
    }
    res.render('trips/detail', {
      tripMatch: req.tripMatch,
      driverRequest: req.driverRequest,
      riderRequest: req.riderRequest,
      currentUserRequest: req.currentUserRequest,
      otherUserRequest: req.otherUserRequest,
      driver: req.driver,
      rider: req.rider,
      otherUser: req.otherUser,
      isDriver: req.isDriver,
      firstPlaceID,
      lastPlaceID,
      midPlaceID,
      firstPlaceDescription,
      midPlaceDescription,
      lastPlaceDescription,
      driverProfileImageURL,
      riderProfileImageURL,
      googleMapsAPIKey,
      otherLoc
    })
  } catch (err) {
    console.error(err)
    internalError(req, res, 'internal-error')
  }
})

/**
 * Send confirmation emails when both members confirm a trip
 * @param tripMatch The trip to confirm
 * @param driver The driver
 * @param rider The rider
 * @param driverRequest The driver's request
 * @param riderRequest The rider's request
 */
function sendConfirmationEmails(
  tripMatch: TripMatch,
  driver: User,
  rider: User,
  driverRequest: TripRequest,
  riderRequest: TripRequest
) {
  if (driver.allow_notifications) {
    sendTripConfirmationEmail(
      driver,
      rider,
      tripMatch,
      riderRequest,
      driverRequest
    )
  }
  if (rider.allow_notifications) {
    sendTripConfirmationEmail(
      rider,
      driver,
      tripMatch,
      riderRequest,
      driverRequest
    )
  }
}

routes.post('/confirm', async (req: MatchRequest, res: Response) => {
  try {
    if (req.isDriver) {
      await db<TripMatch>('trip_matches')
        .update({
          driver_confirmed: true,
        })
        .where('id', req.tripMatch.id)

      if (req.tripMatch.rider_confirmed) {
        sendConfirmationEmails(
          req.tripMatch,
          req.driver,
          req.rider,
          req.driverRequest,
          req.riderRequest
        )
      }
    } else {
      await db<TripMatch>('trip_matches')
        .update({
          rider_confirmed: true,
        })
        .where('id', req.tripMatch.id)

      if (req.tripMatch.rider_confirmed) {
        sendConfirmationEmails(
          req.tripMatch,
          req.driver,
          req.rider,
          req.driverRequest,
          req.riderRequest
        )
      }
    }

    res.redirect(`/trips/${req.tripMatch.id}`)
    return
  } catch (err) {
    console.error(err)
    internalError(req, res, 'internal-error')
  }
})

routes.post('/reject', async (req: MatchRequest, res: Response) => {
  const reasons = [
    'incompatible-location',
    'incompatible-times',
    'block-person',
  ]
  const requestedReason = req.body.blockReason
  if (!requestedReason) {
    console.error("Block reason wasn't provided")
    res.sendStatus(400)
    return
  }

  if (reasons.indexOf(requestedReason) < 0) {
    console.error(`Forbidden block reason: ${requestedReason}`)
    res.sendStatus(403)
    return
  }

  await db<PairRejection>('pair_rejections').insert({
    blocker_id: req.user.id,
    blockee_id: req.otherUser.id,
  })
  await db<TripMatch>('trip_matches').where({ id: req.tripMatch.id }).del()

  res.redirect('/trips?reject=success')
  return
})

export default routes
