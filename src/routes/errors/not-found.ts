import { Request, Response } from 'express'

/**
 * Process a request as not found and
 * fill out a template to make it look nice.
 *
 * This route will always send a response, so
 * assure to `return` after invocation.
 *
 * @param req The request object
 * @param res The response object
 */
export function notFound(req: Request, res: Response) {
  res.status(404)
  res.render('errors/not-found')
}
