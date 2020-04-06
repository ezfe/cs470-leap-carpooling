import { Response, Router } from 'express'
import db from '../../db'
import { TripRequest } from '../../models/trip_requests'
import { ReqAuthedReq } from '../../utils/authed_req'

const routes = Router({ mergeParams: true })

async function preprocess(req: ReqAuthedReq): Promise<TripRequest> {
  const id = parseInt(req.params.requestID, 10)

  const request = await db('trip_requests').where({ id }).first<TripRequest>()
  return request
}

routes.post('/cancel', async (req: ReqAuthedReq, res: Response) => {
  try {
    const tripRequest = await preprocess(req)

    if (!tripRequest) {
      res.sendStatus(404)
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
