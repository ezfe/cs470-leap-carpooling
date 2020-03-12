import { Raw } from "knex";
import db from "../db";

export async function getTripMatchByID(id: number): Promise<TripMatch> {
  if (!id) return null

  const match = await db<TripMatch>('trip_matches').where('id', id).first()
  return match || null
}

export interface TripMatch {
  id: number
  driver_request_id: number
  rider_request_id: number
  date: Date | Raw<any>
  time: string
  rider_confirmed: boolean
  driver_confirmed: boolean
  created_at: Date | Raw<any>
}
