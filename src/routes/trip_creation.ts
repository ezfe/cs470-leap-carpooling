import { Router, Response } from 'express'
import { AuthedReq } from '../utils/authed_req'

const routes = Router()

// /trips/new
routes.get('/', (req: AuthedReq, res: Response) => {
  const googleMapsAPIKey = process.env.GOOGLE_MAPS_PLACES_KEY
  if (!googleMapsAPIKey) {
    res.send('GOOGLE_MAPS_PLACES_KEY is unset')
    return
  }
  res.render('new_trip', { googleMapsAPIKey })
})

routes.post('/', (req: AuthedReq, res: Response) => {
  res.send(req.body)
})

export default routes
