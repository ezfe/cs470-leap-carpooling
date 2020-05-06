import { Request, Response } from 'express'

/**
 * Process a request as an internal error and
 * fill out a template to make it look nice.
 *
 * This route will always send a response to
 * the browser, so assure to `return` after invocation.
 */
export function internalError(
  req: Request,
  res: Response,
  error: 'internal-error' | 'google-maps-key' | 'cas'
) {
  if (error == 'cas') {
    res.status(401)
  } else {
    res.status(500)
  }
  res.render('errors/internal-error', { error })
}
