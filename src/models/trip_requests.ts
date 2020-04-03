import { Raw } from "knex";
import { TripDirection, UserRole } from "./misc_types";

export interface TripRequest {
  id: number
  member_id: number
  role: UserRole
  location: string
  location_description: string
  deviation_limit: number
  direction: TripDirection
  first_date: Date | Raw<any>
  last_date: Date | Raw<any>

  created_at: Date | Raw<any>
}
