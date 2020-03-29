import { Raw } from "knex";
import { TripDirection } from "./misc_types";

export interface TripRequest {
  id: number
  member_id: number
  role: 'driver' | 'rider'
  location: string
  location_description: string
  deviation_limit: number,
  direction: TripDirection
  created_at: Date | Raw<any>
}
