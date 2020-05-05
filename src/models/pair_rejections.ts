/* eslint-disable @typescript-eslint/no-explicit-any */
import { Raw } from 'knex'

/**
 * Recording that a user rejected a pair with another user
 */
export interface PairRejection {
  id: number
  blocker_id: number
  blockee_id: number
  expire_after: Date | Raw<any>
}
