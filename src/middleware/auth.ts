import { getUserByID } from '../models/users'
import { Request, Response, NextFunction } from 'express'
import { AuthedReq } from '../utils/authed_req'

export async function authenticateUser(req: AuthedReq, res: Response, next: NextFunction) {
  const user = await getUserByID(req.session.userID)
  req.user = user
  if (user) {
    res.locals.current_user = user
    if (user.preferred_name && user.preferred_name.length > 0) {
      res.locals.user_preferred_name = user.preferred_name
    } else {
      res.locals.user_preferred_name = user.first_name
    }
  } else {
    res.locals.current_user = null
  }
  next()
}

export function requireAuthenticated(req: AuthedReq, res: Response, next: NextFunction) {
  if (!req.user) {
    console.error('User not logged in, redirecting')
    res.redirect('/sessions/login')
  } else {
    console.log(`User logged in as ${req.user.netid}`)
    next()
  }
}
