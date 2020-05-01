import Joi from '@hapi/joi'

export const preferredName = {
  autocomplete: 'given-name',
  min: 2,
  max: 100,
  pattern: /[^0-9_!¡?÷?¿/+=@#$%ˆ&*(){}|~<>;:[\]]{2,}/,
}

export const preferredEmail = {
  max: 100,
}

export const phoneNumber = {
  pattern: /\+?[0-9() -]{10,}/,
  min: 10,
  max: 30,
}

export const deviationLimit = {
  min: 0,
  max: 10_000_0000
}

export const joiConstraints = {
  preferred_name: Joi.string()
    .pattern(preferredName.pattern)
    .min(preferredName.min)
    .max(preferredName.max)
    .empty('')
    .default(null),

  preferred_email: Joi.string()
    .email()
    .max(preferredEmail.max)
    .empty('')
    .default(null),

  phone_number: Joi.string()
    .pattern(phoneNumber.pattern)
    .min(phoneNumber.min)
    .max(phoneNumber.max),

  allow_notifications: Joi.boolean().truthy('on').default(false),

  deviation_limit: Joi.number().integer().min(deviationLimit.min).max(deviationLimit.max).empty('').default(null)
}
