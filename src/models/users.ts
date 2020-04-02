import db from '../db'
import { Raw } from 'knex'
import { Request } from 'express'
import { UserRole } from './misc_types'

export function setLoggedInAs(req: Request, user: User | undefined) {
  if (req.session) {
    req.session.userID = user?.id
  }
}

export function setLoggedOut(req: Request) {
  if (req.session) {
    req.session.userID = undefined
  }
}

export async function getUserByID(id: number): Promise<User | undefined> {
  return getUserByField('id', id)
}

export async function getUserByNetID(netid: string): Promise<User | undefined> {
  return getUserByField('netid', netid)
}

async function getUserByField(field: string, value: number | string): Promise<User | undefined> {
  if (!field) return undefined
  if (!value) return undefined

  const user = await db<User>('users').where(field, value).first()
  return user || undefined
}

export interface User {
  id: number
  netid: string
  email?: string
  default_role?: UserRole
  default_location?: string
  default_location_description?: string
  deviation_limit?: number
  first_name: string
  last_name: string
  preferred_name?: string
  phone_number?: string
  profile_image_name?: string | null
  created_at: Date | Raw<any>
}