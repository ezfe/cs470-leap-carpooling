/* eslint-disable @typescript-eslint/no-explicit-any */
import { Raw } from 'knex'
import db from '../db'
import { User } from './users'
import { UserRole, TripDirection } from './misc_types'

export interface TripMatch {
  id: number
  driver_request_id: number
  rider_request_id: number
  first_date: Date | Raw<any>
  last_date: Date | Raw<any>
  rider_confirmed: boolean
  driver_confirmed: boolean
  first_portion: UserRole
  created_at: Date | Raw<any>
  notification_sent: boolean
}

export interface AnnotatedTripMatch {
  id: number
  first_date: Date | Raw<any>
  last_date: Date | Raw<any>
  rider_confirmed: boolean
  driver_confirmed: boolean
  direction: TripDirection
  driver_request_id: number
  rider_request_id: number
  driver_id: number
  rider_id: number
  driver_location_description: number
  rider_location_description: number
}

/**
 * Get annotated TripMatches
 * @param user The user who must be a member of the match
 * @param filter Filter for matches in the future or the past
 * @param actionNeeded Whether the user in question also needs to confirm the trip
 */
export async function getTripMatches(
                                      user: User,
                                      filter: "past" | "future" | null,
                                      actionNeeded: boolean | null
                                    ): Promise<AnnotatedTripMatch[]> {

  const orderByParam = (filter === 'past' ? 'desc' : 'asc')

  let query = db('trip_matches')
    .select(
      'trip_matches.id',
      'trip_matches.first_date',
      'trip_matches.last_date',
      'trip_matches.rider_confirmed',
      'trip_matches.driver_confirmed',
      db.ref('driver_t.direction').as('direction'),
      db.ref('driver_t.id').as('driver_request_id'),
      db.ref('rider_t.id').as('rider_request_id'),
      db.ref('driver_t.member_id').as('driver_id'),
      db.ref('rider_t.member_id').as('rider_id'),
      db.ref('driver_t.location_description').as('driver_location_description'),
      db.ref('rider_t.location_description').as('rider_location_description')
    )
    .join(
      'trip_requests as driver_t',
      'trip_matches.driver_request_id',
      'driver_t.id'
    )
    .join(
      'trip_requests as rider_t',
      'trip_matches.rider_request_id',
      'rider_t.id'
    )
    .orderBy('trip_matches.first_date', orderByParam)
    .where(function () {
      this.where('driver_t.member_id', user.id).orWhere(
        'rider_t.member_id',
        user.id
      )
    })

  if (filter === 'past') {
    query = query.andWhere('trip_matches.last_date', '<', db.fn.now())
  } else if (filter === 'future') {
    query = query.andWhere('trip_matches.last_date', '>=', db.fn.now())
  }

  // Since in JavaScript, null is falsy,
  // can't just if (actionNeeded) else if (!actionNeeded)
  if (actionNeeded === true) {
    query = query.andWhere(function() {
      this.where({
        'trip_matches.driver_confirmed': false,
        'driver_t.member_id': user.id
      }).orWhere({
        'trip_matches.rider_confirmed': false,
        'rider_t.member_id': user.id
      })
    })
  } else if (actionNeeded === false) {
    query = query.andWhere(function() {
      this.where({
        'trip_matches.driver_confirmed': true,
        'driver_t.member_id': user.id
      }).orWhere({
        'trip_matches.rider_confirmed': true,
        'rider_t.member_id': user.id
      })
    })
  }

  return await query
}
