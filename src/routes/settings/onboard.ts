import crypto from 'crypto'
import { Response, Router } from 'express'
import fs from 'fs'
import multer from 'multer'
import path from 'path'
import db from '../../db'
import { User } from '../../models/users'
import { ReqAuthedReq } from '../../utils/authed_req'
import { sendWelcomeEmail } from '../../utils/emails'
import { phoneNumber, preferredEmail, preferredName } from '../../validation'
import { onboardSchema } from '../../validation/onboard'
import { internalError } from '../errors/internal-error'

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

/**
 * GET /settings/onboard
 *
 * Onboard the user, collecting basic information
 * required for proper site operation.
 */
routes.get('/', (req: ReqAuthedReq, res: Response) => {
  const profileImageURL =
    req.user.profile_image_name || 'static/blank-profile.png'

  const constraints = {
    preferredName,
    preferredEmail,
    phoneNumber,
  }

  res.render('settings/onboard', { profileImageURL, constraints })
})

/**
 * POST /settings/onboard
 *
 * Record the onboarding data posted by the user's browser.
 */
routes.post('/', async (req: ReqAuthedReq, res: Response) => {
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
      internalError(req, res, 'internal-error')
    }
  }
})

/**
 * POST /settings/onboard/upload-onboard-image
 *
 * Save new profile image posted by the browser
 */
routes.post(
  '/upload-onboard-image',
  upload.single('profile_photo'),
  async (req: ReqAuthedReq, res: Response) => {
    try {
      await db<User>('users').where({ id: req.user.id }).update({
        profile_image_name: req.file.path,
      })
      res.redirect('/settings/onboard')
    } catch (err) {
      console.error(err)
      internalError(req, res, 'internal-error')
    }
  }
)

/**
 * GET /settings/onboard/remove-profile-image
 *
 * Endpoint that deletes the current profile image and
 * returns the user back to the onboard page
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
      res.redirect('/settings/onboard')
    } catch (err) {
      console.error(err)
      internalError(req, res, 'internal-error')
    }
  }
)

export default routes
