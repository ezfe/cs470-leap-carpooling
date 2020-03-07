const db = require('../db')

function getUserByID(id) {
  return getUserByField('id', id)
}

function getUserByNetID(netid) {
  return getUserByField('netid', netid)
}

async function getUserByField(field, value) {
  if (!field) return null
  if (!value) return null

  const user = await db('users').where(field, value).first()
  return user || null
}

module.exports = { getUserByID, getUserByNetID }
