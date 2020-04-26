import crypto from 'crypto'
import { Response, Router } from 'express'
import fs from 'fs'
import multer from 'multer'
import path from 'path'
import db from '../db'
import { User } from '../models/users'
import { ReqAuthedReq } from '../utils/authed_req'
import { sendWelcomeEmail } from '../utils/emails'
import { phoneNumber, preferredEmail, preferredName } from '../validation'
import { onboardSchema } from '../validation/onboard'
import { settingsSchema } from '../validation/settings'
import { geocode } from '../utils/geocoding'
import { formatLocation } from '../utils/location_formatter'

const routes = Router()

const storage = multer.diskStorage({
  destination: 'public/uploads/',
  filename: (req, file, callback) => {
    crypto.randomBytes(16, (err, raw) => {
      callback(
        null,
        Date.now() + '-' + raw.toString('hex') + path.extname(file.originalname)
      )
    })
  },
})

const upload = multer({ storage })

routes.get('/onboard', (req: ReqAuthedReq, res: Response) => {
  const profileImageURL =
    req.user.profile_image_name || 'static/blank-profile.png'

  const constraints = {
    preferredName,
    preferredEmail,
    phoneNumber,
  }

  res.render('settings/onboard', { profileImageURL, constraints })
})

routes.post('/onboard', async (req: ReqAuthedReq, res: Response) => {
  try {
    const validated = await onboardSchema.validateAsync(req.body)

    const users = await db<User>('users')
      .where({ id: req.user.id })
      .update({
        preferred_name: validated.preferred_name,
        email: validated.preferred_email,
        phone_number: validated.phone_number,
        allow_notifications: validated.allow_notifications,
        has_onboarded: true,
      })
      .returning('*')

    const newUser = users[0]

    if (validated.allow_notifications) {
      sendWelcomeEmail(newUser)
    }

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

routes.post(
  '/onboard/upload-onboard-image',
  upload.single('profile_photo'),
  async (req: ReqAuthedReq, res: Response) => {
    try {
      await db<User>('users').where({ id: req.user.id }).update({
        profile_image_name: req.file.path,
      })
      res.redirect('/settings/onboard')
    } catch (err) {
      res.render('database-error')
    }
  }
)

routes.get(
  '/onboard/remove-profile-image',
  async (req: ReqAuthedReq, res: Response) => {
    try {
      await db<User>('users').where({ id: req.user.id }).update({
        profile_image_name: null,
      })

      if (req.user.profile_image_name) {
        try {
          fs.unlinkSync(req.user.profile_image_name)
        } catch (err) {
          // An error deleting the file shouldn't be a failure,
          // since it probably means the file doesn't exist
          console.error(err)
        }
      }
      res.redirect('/settings/onboard')
    } catch (err) {
      console.error(err)
      res.render('database-error')
    }
  }
)

routes.get('/', async (req: ReqAuthedReq, res: Response) => {
  const googleMapsAPIKey = process.env.GOOGLE_MAPS_PLACES_KEY
  if (!googleMapsAPIKey) {
    res.send('GOOGLE_MAPS_PLACES_KEY is unset')
    return
  }

  const constraints = {
    preferredName,
    preferredEmail,
    phoneNumber,
  }

  const profileImageURL =
    req.user.profile_image_name || '/static/blank-profile.png'

  const blockedUsers: User[] = await db('pair_rejections')
    .select('users.*')
    .where('blocker_id', req.user.id)
    .innerJoin('users', 'users.id', 'pair_rejections.blockee_id')

  const defaultLocationInformation = req.user.default_location_description
  let formattedLocation = ''
  if (defaultLocationInformation) {
    formattedLocation = await formatLocation(defaultLocationInformation, 'full')

    console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%')
    console.log(formattedLocation)
    console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%')
  }

  //const temp =await(locationCity(validated.place_id))
  // const locDict = JSON.stringify(temp)

  res.render('settings/index', {
    constraints,
    googleMapsAPIKey,
    profileImageURL,
    blockedUsers,
    formattedLocation,
  })
})

routes.get(
  '/remove-profile-image',
  async (req: ReqAuthedReq, res: Response) => {
    try {
      await db<User>('users').where({ id: req.user.id }).update({
        profile_image_name: null,
      })

      if (req.user.profile_image_name) {
        try {
          fs.unlinkSync(req.user.profile_image_name)
        } catch (err) {
          // An error deleting the file shouldn't be a failure,
          // since it probably means the file doesn't exist
          console.error(err)
        }
      }
      res.redirect('/settings')
    } catch (err) {
      console.error(err)
      res.render('database-error')
    }
  }
)

routes.post('/', async (req: ReqAuthedReq, res: Response) => {
  try {
    const validated = await settingsSchema.validateAsync(req.body)

    const locationInformation = await geocode(validated.place_id)
    const locationJSON = JSON.stringify(locationInformation)

    await db<User>('users').where({ id: req.user.id }).update({
      preferred_name: validated.preferred_name,
      email: validated.preferred_email,
      phone_number: validated.phone_number,
      default_location: validated.place_id,
      default_location_description: locationJSON,
      deviation_limit: validated.deviation_limit,
      allow_notifications: validated.allow_notifications,
    })

    res.redirect('/settings')
  } catch (err) {
    console.error(err)
    res.render('database-error')
  }
})

routes.post(
  '/upload-image',
  upload.single('profile_photo'),
  async (req: ReqAuthedReq, res: Response) => {
    try {
      // Prepend a / so that public/uploads/file.jpg becomes /public/uploads/file.jpg
      await db<User>('users').where({ id: req.user.id }).update({
        profile_image_name: req.file.path,
      })
      res.redirect('/settings')
    } catch (err) {
      res.render('database-error')
    }
  }
)

export default routes
