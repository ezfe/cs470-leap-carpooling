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
  start_date: Date | Raw<any>
  end_date: Date | Raw<any>
  created_at: Date | Raw<any>
}
