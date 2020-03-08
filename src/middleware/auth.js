const { getUserByID } = require('../models/users')

async function authenticateUser(req, res, next) {
  const user = await getUserByID(req.session.userID)
  req.user = user
  next()
}

function requireAuthenticated(req, res, next) {
  if (!req.user) {
    console.error('User not logged in, redirecting')
    res.redirect('/sessions/login')
  } else {
    console.log(`User logged in as ${req.user.netid}`)
    next()
  }
}

module.exports = {
  authenticateUser,
  requireAuthenticated
}
