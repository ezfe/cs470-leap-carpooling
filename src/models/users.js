const db = require('../db')

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
  setLoggedInAs,
  getUserByID,
  getUserByNetID
}
