import { Response, Router } from 'express'
import fs from 'fs'
import { upload } from '.'
import db from '../../db'
import { User } from '../../models/users'
import { ReqAuthedReq } from '../../utils/authed_req'
import { sendWelcomeEmail } from '../../utils/emails'
import { phoneNumber, preferredEmail, preferredName } from '../../validation'
import { onboardSchema } from '../../validation/onboard'

const routes = Router()

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

export default routes
