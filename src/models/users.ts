/* eslint-disable @typescript-eslint/no-explicit-any */
import db from '../db'
import { Raw } from 'knex'
import { Request } from 'express'
import { UserRole } from './misc_types'

/**
 * Record in the session that the user is logged in
 * @param req The request
 * @param user The user
 */
export function setLoggedInAs(req: Request, user: User | null) {
  if (req.session) {
    req.session.userID = user?.id
  }
}

/**
 * Log out the current user
 * @param req The request
 */
export function setLoggedOut(req: Request) {
  if (req.session) {
    req.session.userID = null
  }
}

/**
 * Get a user by their id
 * @param id The user's id
 */
export async function getUserByID(id: number): Promise<User | null> {
  return getUserByField('id', id)
}

/**
 * Get a user by their netid
 * @param netid The user's netid
 */
export async function getUserByNetID(netid: string): Promise<User | null> {
  return getUserByField('netid', netid)
}

async function getUserByField(
  field: string,
  value: number | string
): Promise<User | null> {
  if (!field) return null
  if (!value) return null

  const user = await db<User>('users').where(field, value).first()
  return user || null
}

/**
 * Get the preferred first name of a user
 * @param user The user
 */
export function getPreferredFirstName(user: User): string {
  return user.preferred_name || user.first_name
}

/**
 * Get the set email address of a user
 * @param user The user
 */
export function getEmail(user: User): string {
  return user.email || `${user.netid}@lafayette.edu`
}

/**
 * A user of the website
 */
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
  allow_notifications: boolean
  has_onboarded: boolean
}
