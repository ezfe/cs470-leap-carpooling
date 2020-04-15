import Joi from '@hapi/joi'

export const preferredName = {
  autocomplete: 'given-name',
  min: 2,
  max: 100,
  pattern: /[^0-9_!¡?÷?¿/\+=@#$%ˆ&*(){}|~<>;:[\]]{2,}/
}

export const preferredEmail = {
  max: 100
}

export const phoneNumber = {
  pattern: /\+?[0-9\(\) -]{10,}/,
  min: 10,
  max: 30
}

export const settingsSchema = Joi.object({
  preferred_name: Joi.string()
    .pattern(preferredName.pattern)
    .min(preferredName.min)
    .max(preferredName.max),

  preferred_email: Joi.string()
    .email()
    .max(preferredEmail.max),

  phone_number: Joi.string()
    .pattern(phoneNumber.pattern)
    .min(phoneNumber.min)
    .max(phoneNumber.max),

  place_name: Joi.string(),
  place_id: Joi.string(),

  deviation_limit: Joi.number()
    .integer()
    .positive(),

  allow_notifications: Joi.boolean()
    .truthy('on')
})

