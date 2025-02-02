import Joi from '@hapi/joi'
import { joiConstraints } from '.'
export const settingsSchema = Joi.object({
  preferred_name: joiConstraints.preferred_name,
  preferred_email: joiConstraints.preferred_email,
  phone_number: joiConstraints.phone_number,
  allow_notifications: joiConstraints.allow_notifications,

  place_id: Joi.string(),

  deviation_limit: joiConstraints.deviation_limit,
})
