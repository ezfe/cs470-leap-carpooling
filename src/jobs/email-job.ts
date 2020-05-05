import db from '../db'
import { TripMatch } from '../models/trip_matches'
import { TripRequest } from '../models/trip_requests'
import { User } from '../models/users'
import { sendTripReminderEmail } from '../utils/emails'

/**
 * Notify by email all matches that are upcoming
 * in the next 24 hours.
 */
export default async function job(): Promise<void> {
  const matchesToNotify = await db
    .select()
    .from<TripMatch>('trip_matches')
    .where('driver_confirmed', true)
    .where('rider_confirmed', true)
    .where('notification_sent', false)
    .whereBetween('first_date', [
      db.raw('now()'),
      db.raw(`now() + ('1 DAY'::INTERVAL)`),
    ])

  for (const match of matchesToNotify) {
    notifyMatch(match)
  }
}

/**
 * Notify the members of a match that a trip is upcoming
 * @param match The upcoming match
 */
async function notifyMatch(match: TripMatch): Promise<void> {
  const driverRequest = await db('trip_requests')
    .where({ id: match.driver_request_id })
    .first<TripRequest>()
  const riderRequest = await db('trip_requests')
    .where({ id: match.rider_request_id })
    .first<TripRequest>()
  const driver = await db('users')
    .where({ id: driverRequest.member_id })
    .first<User>()
  const rider = await db('users')
    .where({ id: riderRequest.member_id })
    .first<User>()

  // Send Driver Notification
  if (driver.allow_notifications) {
    sendTripReminderEmail(driver, rider, match, riderRequest, driverRequest)
  }

  // Send Rider Notification
  if (rider.allow_notifications) {
    sendTripReminderEmail(rider, driver, match, riderRequest, driverRequest)
  }
  
  await db<TripMatch>('trip_matches').where({ id: match.id }).update({
    notification_sent: true,
  })
}
