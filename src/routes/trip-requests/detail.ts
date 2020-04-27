import { Response, Router } from 'express'
import db from '../../db'
import { TripRequest } from '../../models/trip_requests'
import { ReqAuthedReq } from '../../utils/authed_req'
import { notFound } from '../errors/not-found'

const routes = Router({ mergeParams: true })

routes.post('/cancel', async (req: ReqAuthedReq, res: Response) => {
  try {
    const id = parseInt(req.params.requestID, 10)
    const tripRequest = await db('trip_requests').where({ id }).first<TripRequest>()

    if (!tripRequest) {
      notFound(req, res)
      return
    }

    await db('trip_requests').where('id', tripRequest.id).del()

    res.redirect('/trips?delete=success')
  } catch (err) {
    console.error(err)
    res.render('database-error')
  }
})

export default routes
