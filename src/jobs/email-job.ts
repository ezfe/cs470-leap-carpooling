import db from '../db'
import { TripMatch } from '../models/trip_matches'
import { TripRequest } from '../models/trip_requests'
import { User } from '../models/users'
import { sendTripReminderEmail } from '../utils/emails'

export default async function job(): Promise<void> {
  const matchesToNotify = await db.select().from<TripMatch>('trip_matches')
    .where('driver_confirmed', 'true')
    .where('rider_confirmed', 'true')
    .where('notification_sent', 'false')
    .whereBetween('first_date', [db.raw('now()'), db.raw(`now() + ('1 DAY'::INTERVAL)`)])

  for (const match of matchesToNotify) {
    notifyMatch(match)
  }
}

async function notifyMatch(match: TripMatch): Promise<void> {
  const driverRequest = await db('trip_requests').where({ id: match.driver_request_id }).first<TripRequest>()
  const driver = await db('users').where({ id: driverRequest.member_id }).first<User>()
  const driverName = driver.preferred_name || driver.first_name
  const driverEmail = driver.email || `${driver.netid}@lafayette.edu`

  const riderRequest = await db('trip_requests').where({ id: match.rider_request_id }).first<TripRequest>()
  const rider = await db('users').where({ id: riderRequest.member_id }).first<User>()
  const riderName = rider.preferred_name || rider.first_name
  const riderEmail = rider.email || `${rider.netid}@lafayette.edu`

  // Send Driver Notification
  if (driver.allow_notifications) {
    sendTripReminderEmail(
      driverName,
      driverEmail,
      match.first_date,
      match.last_date,
      true,
      riderName,
      driverRequest.direction,
      driverRequest.location_description,
      riderRequest.location_description
    )
  }

  // Send Rider Notification
  if (rider.allow_notifications) {
    sendTripReminderEmail(
      riderName,
      riderEmail,
      match.first_date,
      match.last_date,
      true,
      driverName,
      driverRequest.direction,
      driverRequest.location_description,
      riderRequest.location_description
    )
  }
  await db<TripMatch>('trip_matches').where({ id: match.id })
    .update({
      notification_sent: true
  })
}
