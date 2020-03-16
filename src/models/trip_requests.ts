import { Raw } from "knex";

export interface TripRequest {
  id: number
  member_id: number
  role: 'driver' | 'rider'
  location: string
  location_description: string
  deviation_limit: number,
  direction: 'towards_lafayette' | 'from_lafayette'
  created_at: Date | Raw<any>
}