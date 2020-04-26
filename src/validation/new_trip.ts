import Joi from '@hapi/joi'
import { joiConstraints } from '.'
import {} from '.'

export const newTripSchema = Joi.object({
  user_role: Joi.string().valid('driver', 'rider').required(),
  place_id: Joi.string().required(),
  trip_direction: Joi.string().valid('towards_lafayette', 'from_lafayette').required(),
  first_date: Joi.string().required(),
  last_date: Joi.string().required(),

  deviation_limit: joiConstraints.deviation_limit,
})
