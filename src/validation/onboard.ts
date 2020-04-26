import Joi from '@hapi/joi'
import { joiConstraints } from '.'

export const onboardSchema = Joi.object({
  preferred_name: joiConstraints.preferred_name,
  preferred_email: joiConstraints.preferred_email,
  phone_number: joiConstraints.phone_number,
  allow_notifications: joiConstraints.allow_notifications,
})
