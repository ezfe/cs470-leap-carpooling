import { Response, Router } from 'express'
import db from '../../db'
import { ReqAuthedReq } from '../../utils/authed_req'

const routes = Router({ mergeParams: true })

routes.post('/', async (req: ReqAuthedReq, res: Response) => {
  try {
    const id = req.params.userId
    const blockedid = await db('users').select('id').where('netid', id )
    const blockeeid = blockedid[0].id
    const currentUser = req.user.id
    await db('pair_rejections').where('blockee_id',blockeeid).where('blocker_id', currentUser).del()

     res.redirect('../settings')
  } catch (err) {
    console.error(err)
    res.render('database-error')
  }
})

export default routes