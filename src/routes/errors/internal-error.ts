import { Request, Response } from 'express'

/**
 * Process a request as an internal error and
 * fill out a template to make it look nice.
 *
 * This route will always send a response, so
 * assure to `return` after invocation.
 *
 * @param req The request object
 * @param res The response object
 */
export function internalError(req: Request, res: Response, error: 'internal-error' | 'google-maps-key') {
  res.status(500)
  res.render('errors/internal-error', { error })
}
