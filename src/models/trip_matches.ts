import { Raw } from "knex";
import db from "../db";

export async function getTripMatchByID(id: number): Promise<TripMatch | undefined> {
  if (!id) return undefined

  const match = await db<TripMatch>('trip_matches').where('id', id).first()
  return match || undefined
}

export interface TripMatch {
  id: number
  driver_request_id: number
  rider_request_id: number
  date: Date | Raw<any>
  time: 'morning' | 'afternoon'
  rider_confirmed: boolean
  driver_confirmed: boolean
  first_portion: 'driver' | 'rider'
  created_at: Date | Raw<any>
}
