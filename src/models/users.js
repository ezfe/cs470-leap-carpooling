const db = require('../db')

async function getLoggedInUser(req) {
  return getUserByID(req.session.userID)
}

function setLoggedInAs(req, user) {
  req.session.userID = user.id
}

async function getUserByID(id) {
  return getUserByField('id', id)
}

async function getUserByNetID(netid) {
  return getUserByField('netid', netid)
}

async function getUserByField(field, value) {
  if (!field) return null
  if (!value) return null

  const user = await db('users').where(field, value).first()
  return user || null
}

module.exports = {
  getLoggedInUser,
  setLoggedInAs,
  getUserByID,
  getUserByNetID
}
