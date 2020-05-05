import { NextFunction, Response } from 'express'
import { getUserByID } from '../models/users'
import { AuthedReq } from '../utils/authed_req'

/**
 * Middleware to check if a user is authenticated,
 * and record that on the request object
 * @param req The request
 * @param res The response
 * @param next The next chain function
 */
export async function authenticateUser(
  req: AuthedReq,
  res: Response,
  next: NextFunction
) {
  const user = await getUserByID(req?.session?.userID)

  req.user = user
  if (user) {
    res.locals.currentUser = user
    if (user.preferred_name && user.preferred_name.length > 0) {
      res.locals.user_preferred_name = user.preferred_name
    } else {
      res.locals.user_preferred_name = user.first_name
    }
  } else {
    res.locals.currentUser = null
  }
  next()
}

/**
 * Middleware to require that a user is authenticated
 * @param req The request
 * @param res The response
 * @param next The next chain function
 */
export function requireAuthenticated(
  req: AuthedReq,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    if (req.session && req.method === 'GET') {
      req.session.loginRedirect = req.originalUrl
    }

    res.redirect('/sessions/login?forwarding=t')
  } else {
    if (req.originalUrl.indexOf('onboard') < 0 && !req.user.has_onboarded) {
      res.redirect('/settings/onboard')
      return
    }

    next()
  }
}
