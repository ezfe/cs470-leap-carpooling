import crypto from 'crypto'
import { Response, Router } from 'express'
import fs from 'fs'
import multer from 'multer'
import path from 'path'
import db from '../../db'
import { User } from '../../models/users'
import { ReqAuthedReq } from '../../utils/authed_req'
import { geocode } from '../../utils/geocoding'
import { formatLocation } from '../../utils/location_formatter'
import {
  deviationLimit,
  phoneNumber,
  preferredEmail,
  preferredName,
} from '../../validation'
import { settingsSchema } from '../../validation/settings'
import { internalError } from '../errors/internal-error'
import onboard from './onboard'

/**
 * This file is pre-processed by middleware that requires
 * authentication, so all requests may be ReqAuthRequest.
 */

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

routes.use('/onboard', onboard)

/**
 * GET /settings
 * 
 * Main Settings Page
 */
routes.get('/', async (req: ReqAuthedReq, res: Response) => {
  const googleMapsAPIKey = process.env.GOOGLE_MAPS_BROWSER_KEY
  if (!googleMapsAPIKey) {
    console.error(
      'GOOGLE_MAPS_BROWSER_KEY must be set to load the settings page'
    )
    internalError(req, res, 'google-maps-key')
    return
  }

  const constraints = {
    preferredName,
    preferredEmail,
    phoneNumber,
    deviationLimit,
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

/**
 * GET /settings/remove-profile-image
 * 
 * Endpoint that deletes the current profile image and
 * returns the user back to the settings page
 */
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
      internalError(req, res, 'internal-error')
    }
  }
)

/**
 * POST /settings
 * 
 * Record new settings posted by the browser to
 * this endpoint.
 */
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
    internalError(req, res, 'internal-error')
  }
})

/**
 * POST /settings/upload-image
 * 
 * Save new profile image posted by the browser
 */
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
      console.error(err)
      internalError(req, res, 'internal-error')
    }
  }
)

export default routes
