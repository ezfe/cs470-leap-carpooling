import db from '../db'

/**
 * Delete all expired pair rejections. These are created
 * when the user rejects for a reason other than "I don't want to ride
 * with <Other Person>".
 * 
 * They're deleted the day after the expire-date listed.
 */
export default async function job(): Promise<void> {
  await db('pair_rejections')
    .where('expire_after', '<', db.raw('CURRENT_DATE'))
    .del()
}
