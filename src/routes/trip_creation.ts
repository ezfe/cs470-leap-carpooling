import { Router } from 'express'

const routes = Router()

// /trips/new
routes.get('/', (req, res) => {
  const googleMapsAPIKey = process.env.GOOGLE_MAPS_PLACES_KEY
  if (!googleMapsAPIKey) {
    res.send('GOOGLE_MAPS_PLACES_KEY is unset')
    return
  }
  res.render('new_trip', { googleMapsAPIKey })
})

routes.post('/', (req, res) => {
  res.send(req.body)
})

export default routes
