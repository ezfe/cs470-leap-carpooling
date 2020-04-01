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

export interface AnnotatedTripMatch {
  id: number
  date: Date | Raw<any>
  time: 'morning' | 'afternoon'
  rider_confirmed: boolean
  driver_confirmed: boolean
  direction: TripDirection
  driver_request_id: number
  rider_request_id: number
  driver_id: number,
  rider_id: number,
  driver_location_description: number
  rider_location_description: number
}

function tripMatchesBuilder(user: User | null) {
  const query = db('trip_matches')
    .select(
      'trip_matches.id',
      'trip_matches.date',
      'trip_matches.time',
      'trip_matches.rider_confirmed',
      'trip_matches.driver_confirmed',
      db.ref('driver_t.id').as('driver_request_id'),
      db.ref('rider_t.id').as('rider_request_id'),
      db.ref('driver_t.member_id').as('driver_id'),
      db.ref('rider_t.member_id').as('rider_id'),
      db.ref('driver_t.location_description').as('driver_location_description'),
      db.ref('rider_t.location_description').as('rider_location_description'),
    ).join(
      'trip_requests as driver_t',
      'trip_matches.driver_request_id', 'driver_t.id'
    ).join(
      'trip_requests as rider_t',
      'trip_matches.rider_request_id', 'rider_t.id'
    )

  if (user) {
    return query.where(
        'driver_t.member_id', user.id,
      ).orWhere(
        'rider_t.member_id', user.id
      )
  } else {
    return query
  }
}

export async function getTripMatches(user: User | null): Promise<AnnotatedTripMatch[]> {
  const tripRequests = await tripMatchesBuilder(user) // .toSQL()
  // console.log(tripRequests)


  return tripRequests
}

export async function getTripMatch(matchID: number): Promise<AnnotatedTripMatch> {
  return await tripMatchesBuilder(null).andWhere('trip_matches.id', matchID).first<AnnotatedTripMatch>()
}

// export async function getTripMatchByID(id: number): Promise<TripMatch | undefined> {
//   if (!id) return undefined

//   const match = await db<TripMatch>('trip_matches').where('id', id).first()
//   return match || undefined
// }

