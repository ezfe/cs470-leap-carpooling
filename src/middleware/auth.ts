import { NextFunction, Response } from 'express'
import { getUserByID } from '../models/users'
import { AuthedReq } from '../utils/authed_req'

export async function authenticateUser(req: AuthedReq, res: Response, next: NextFunction) {
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

export function requireAuthenticated(req: AuthedReq, res: Response, next: NextFunction) {
  if (!req.user) {
    if (req.session && req.method === 'GET') {
      req.session.loginRedirect = req.originalUrl
    }

    res.redirect('/sessions/login?forwarding=t')
  } else {
    if (req.originalUrl.indexOf('onboard') < 0
        && !req.user.has_onboarded) {

      res.redirect('/settings/onboard')
      return
    }

    next()
  }
}
