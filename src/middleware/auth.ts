import { getUserByID } from '../models/users'

export async function authenticateUser(req, res, next) {
  const user = await getUserByID(req.session.userID)
  req.user = user
  if (user) {
    res.locals.user_logged_in = true
    if (user.preferred_name && user.preferred_name.length > 0) {
      res.locals.user_preferred_name = user.preferred_name
    } else {
      res.locals.user_preferred_name = user.first_name
    }
  } else {
    res.locals.user_logged_in = false
  }
  next()
}

export function requireAuthenticated(req, res, next) {
  if (!req.user) {
    console.error('User not logged in, redirecting')
    res.redirect('/sessions/login')
  } else {
    console.log(`User logged in as ${req.user.netid}`)
    next()
  }
}
