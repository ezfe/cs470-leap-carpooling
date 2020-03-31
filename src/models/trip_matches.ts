import { Raw } from "knex";
import db from "../db";
import { User } from "./users";
import { UserRole, TripDirection } from "./misc_types";

export interface TripMatch {
  id: number
  driver_request_id: number
  rider_request_id: number
  date: Date | Raw<any>
  time: 'morning' | 'afternoon'
  rider_confirmed: boolean
  driver_confirmed: boolean
  first_portion: UserRole
  created_at: Date | Raw<any>
}

interface AnnotatedTripMatch {
  id: number
  role: UserRole
  location_description: string
  direction: TripDirection
  date: Date | Raw<any>
  time: 'morning' | 'afternoon'
  rider_confirmed: boolean
  driver_confirmed: boolean
  my_request_id: number
  driver_request_id: number
  rider_request_id: number
}

export async function getTripMatchesForUser(user: User): Promise<AnnotatedTripMatch[]> {
  const tripRequests = await db<AnnotatedTripMatch>('trip_requests')
    .select(
      'trip_matches.id',
      'trip_requests.role',
      'trip_requests.location_description',
      'trip_requests.direction',
      'trip_matches.date',
      'trip_matches.time',
      'trip_matches.rider_confirmed',
      'trip_matches.driver_confirmed',
      db.ref('trip_requests.id').as('trip_request_id'),
      'trip_matches.driver_request_id',
      'trip_matches.rider_request_id',
    ).join('trip_matches', function() {
      this.on('trip_requests.id', '=', 'trip_matches.driver_request_id')
        .orOn('trip_requests.id', '=', 'trip_matches.rider_request_id')
    }).where({
      'trip_requests.member_id': user.id
    })

  return tripRequests
}

// export async function getTripMatchByID(id: number): Promise<TripMatch | undefined> {
//   if (!id) return undefined

//   const match = await db<TripMatch>('trip_matches').where('id', id).first()
//   return match || undefined
// }

