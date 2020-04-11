import crypto from 'crypto'
import { Response, Router } from 'express'
import fs from 'fs'
import multer from 'multer'
import path from 'path'
import db from '../db'
import { User } from '../models/users'
import { ReqAuthedReq } from '../utils/authed_req'
import { PairRejection } from '../models/pair_rejections'
import { sendWelcomeEmail } from '../utils/emails'

const routes = Router()

const storage = multer.diskStorage({
  destination: 'public/uploads/',
  filename: (req, file, callback) => {
    crypto.randomBytes(16, (err, raw) => {
      callback(null, Date.now() + '-' + raw.toString('hex') + path.extname(file.originalname));
    });
  }
});

const upload = multer({ storage });

routes.get('/onboard', (req: ReqAuthedReq, res: Response) => {
  const profileImageURL = req.user.profile_image_name || 'static/blank-profile.png'

  res.render('settings/onboard', { profileImageURL })
})

routes.post('/onboard', async (req: ReqAuthedReq, res: Response) => {

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
    const preferredName = validate('preferred_name', 100)
    const preferredEmail = validate('preferred_email', 100)
    const phoneNumber = validate('phone_number', 30)
    console.log(phoneNumber)

    await db<User>('users').where({ id: req.user.id })
      .update({
        preferred_name: preferredName,
        email: preferredEmail,
        phone_number: phoneNumber,
      })

      sendWelcomeEmail(preferredName || req.user.first_name!, preferredEmail || req.user.email!)

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

routes.post('/onboard/upload-onboard-image', upload.single('profile_photo'), async (req: ReqAuthedReq, res: Response) => {
  try {
    await db<User>('users').where({ id: req.user.id })
    .update({
      profile_image_name: req.file.path
    })
    res.redirect('/settings/onboard')
  } catch (err) {
    res.render('database-error')
  }
})

routes.get('/onboard/remove-profile-image', async (req: ReqAuthedReq, res: Response) => {
  try {
    await db<User>('users').where({ id: req.user.id })
      .update({
        profile_image_name: null
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
})

routes.get('/', async (req: ReqAuthedReq, res: Response) => {
  const googleMapsAPIKey = process.env.GOOGLE_MAPS_PLACES_KEY
  if (!googleMapsAPIKey) {
    res.send('GOOGLE_MAPS_PLACES_KEY is unset')
    return
  }

  const profileImageURL = req.user.profile_image_name || '/static/blank-profile.png'
  const blockedUsers: User[] = await db('pair_rejections')
    .select('users.*')
    .where('blocker_id', req.user.id)
    .innerJoin('users', 'users.id', 'pair_rejections.blockee_id')

  res.render('settings/index', { googleMapsAPIKey, profileImageURL, blockedUsers })
})

routes.get('/remove-profile-image', async (req: ReqAuthedReq, res: Response) => {
  try {
    await db<User>('users').where({ id: req.user.id })
      .update({
        profile_image_name: null
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
})

routes.post('/', async (req: ReqAuthedReq, res: Response) => {
  try {
    await db<User>('users').where({ id: req.user.id })
      .update({
        preferred_name: req.body.preferred_name,
        email: req.body.preferred_email,
        phone_number: req.body._phone,
        default_location: req.body.place_id,
        default_location_description: req.body.place_name,
        deviation_limit: req.body.deviation_limit,
        allow_notifications: req.body.allow_notifications
      })

    res.redirect('/settings')
  } catch (err) {
    res.render('database-error')
  }
})

routes.post('/upload-image', upload.single('profile_photo'), async (req: ReqAuthedReq, res: Response) => {
  try {
    // Prepend a / so that public/uploads/file.jpg becomes /public/uploads/file.jpg
    await db<User>('users').where({ id: req.user.id })
    .update({
      profile_image_name: req.file.path
    })
    res.redirect('/settings')
  } catch (err) {
    res.render('database-error')
  }
})

export default routes