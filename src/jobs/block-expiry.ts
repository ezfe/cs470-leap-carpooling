import db from "../db";

export default async function job(): Promise<void> {
  await db('pair_rejections').where('expire_after', '<', db.raw('CURRENT_DATE')).del()
}