import { NextFunction, Response } from 'express'
import { AuthedReq } from '../utils/authed_req'
import { getEmail, getPreferredFirstName } from '../models/users'

export async function addVariables(req: AuthedReq, res: Response, next: NextFunction) {
  res.locals.siteName = process.env.SITE_NAME
  res.locals.contactEmail = process.env.CONTACT_EMAIL
  res.locals.getEmail = getEmail
  res.locals.getPreferredFirstName = getPreferredFirstName
  next()
}
