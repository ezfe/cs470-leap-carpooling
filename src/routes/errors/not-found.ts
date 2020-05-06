import { Request, Response } from 'express'

/**
 * Process a request as not found and
 * fill out a template to make it look nice.
 *
 * This route will always send a response to
 * the browser, so assure to `return` after invocation.
 */
export function notFound(req: Request, res: Response) {
  res.status(404)
  res.render('errors/not-found')
}
