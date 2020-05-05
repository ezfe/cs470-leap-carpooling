import { NextFunction, Response } from 'express'
import { getEmail, getPreferredFirstName } from '../models/users'
import { AuthedReq } from '../utils/authed_req'

/**
 * Middleware to set context variables used
 * in site rendering
 * @param req The request
 * @param res The response
 * @param next The next chain function
 */
export async function addVariables(
  req: AuthedReq,
  res: Response,
  next: NextFunction
) {
  res.locals.siteName = process.env.SITE_NAME
  res.locals.contactEmail = process.env.CONTACT_EMAIL
  res.locals.getEmail = getEmail
  res.locals.getPreferredFirstName = getPreferredFirstName
  next()
}
