import db from '../db'
import { TripMatch } from '../models/trip_matches'
import { TripRequest } from '../models/trip_requests'
import { User } from '../models/users'
import { sendTripReminderEmail } from '../utils/emails'

export default async function job() {
  const matchesToNotify = await db.select().from<TripMatch>('trip_matches')
    .where('driver_confirmed', 'true')
    .where('rider_confirmed', 'true')
    .where('notification_sent', 'false')
    .whereBetween('first_date', [db.raw('now()'), db.raw(`now() + ('1 DAY'::INTERVAL)`)])
  console.log(matchesToNotify)
  for (const match of matchesToNotify) {
    notifyMatch(match)
  }
}

async function notifyMatch(match : TripMatch) {
  console.log('notifying match')
  const driverRequest = await db('trip_requests').where({ id: match.driver_request_id }).first<TripRequest>()
  const riderRequest = await db('trip_requests').where({ id: match.rider_request_id }).first<TripRequest>()
  const rider = await db('users').where({ id: riderRequest.member_id }).first<User>()
  const driver = await db('users').where({ id: driverRequest.member_id }).first<User>()
  console.log('querying')
  if (driver.allow_notifications) {
    sendTripReminderEmail(driver.preferred_name || driver.first_name, driver.email!, match.first_date, match.last_date, true, 
      rider.preferred_name || rider.first_name, driverRequest.direction, driverRequest.location_description, riderRequest.location_description)
  }
  if (rider.allow_notifications) {
    sendTripReminderEmail(rider.preferred_name || rider.first_name, rider.email!, match.first_date, match.last_date, false,
      driver.preferred_name || driver.first_name, driverRequest.direction, driverRequest.location_description, riderRequest.location_description)
  }
  await db<TripMatch>('trip_matches').where({ id: match.id })
    .update({
      notification_sent: true
  })
}