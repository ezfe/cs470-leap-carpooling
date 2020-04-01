import { Raw } from "knex";
import { TripDirection, UserRole } from "./misc_types";

export interface TripRequest {
  id: number
  member_id: number
  role: UserRole
  location: string
  location_description: string
  deviation_limit: number,
  direction: TripDirection
  created_at: Date | Raw<any>
}
