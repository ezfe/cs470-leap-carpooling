import db from '../db'

export function setLoggedInAs(req, user) {
  req.session.userID = user.id
}

export function setLoggedOut(req) {
  req.session.userID = null
}

export async function getUserByID(id: number): Promise<any> {
  return getUserByField('id', id)
}

export async function getUserByNetID(netid: string): Promise<any> {
  return getUserByField('netid', netid)
}

async function getUserByField(field: string, value: number | string): Promise<any> {
  if (!field) return null
  if (!value) return null

  const user = await db('users').where(field, value).first()
  return user || null
}
