import { Response, Router } from 'express'
import db from '../db'
import { requireAuthenticated } from '../middleware/auth'
import { User } from '../models/users'
import { AuthedReq } from '../utils/authed_req'

const routes = Router()

routes.get('/onboard', requireAuthenticated, (req: AuthedReq, res: Response) => {
  res.render('settings/onboard')
})

routes.post('/onboard', requireAuthenticated, async (req: AuthedReq, res: Response) => {

  function validate(bodyField: string, length: number): string {
    const foundValue = req.body[bodyField]
    if (!foundValue) {
      const e = Error(`Missing value for ${bodyField}`)
      e.name = 'validation-error'
      throw e
    }
    return `${foundValue}`
  }

  try {
    const preferred_name = validate('preferred_name', 100)
    const preferred_email = validate('preferred_email', 100)
    const phone_number = validate('phone_number', 30)

    await db<User>('users').where({ id: req.user.id })
      .update({
        preferred_name,
        email: preferred_email,
        phone_number
      })

    res.redirect('/')
  } catch (err) {
    console.error(err)
    if (err.name === 'validation-error') {
      res.render('settings/onboard')
    } else {
      res.render('database-error')
    }
  }
})

routes.get('/', requireAuthenticated, (req: AuthedReq, res: Response) => {
  const currentUser = req.user
  const googleMapsAPIKey = process.env.GOOGLE_MAPS_PLACES_KEY
  if (!googleMapsAPIKey) {
    res.send('GOOGLE_MAPS_PLACES_KEY is unset')
    return
  }
  res.render('settings/index', { currentUser, googleMapsAPIKey })
})

routes.post('/update-user', requireAuthenticated, async (req: AuthedReq, res: Response) => {
  try {
    await db('users').where({ id: req.user.id })
      .update({
        preferred_name: req.body.preferred_name,
        email: req.body.preferred_email,
        phone_number: req.body._phone,
        default_location: req.body.place_id,
        deviation_limit: req.body.deviation_limit
      })

    res.redirect('/settings')
  } catch (err) {
    res.render('database-error')
  }
})

export default routes