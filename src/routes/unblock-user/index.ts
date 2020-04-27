import { Response, Router } from 'express'
import db from '../../db'
import { ReqAuthedReq } from '../../utils/authed_req'

const routes = Router({ mergeParams: true })

routes.get('/', async (req: ReqAuthedReq, res: Response) => {
  try {
    const unblockID = req.params.userId
    const currentUserID = req.user.id
    await db('pair_rejections')
      .where('blockee_id', unblockID)
      .where('blocker_id', currentUserID)
      .del()

    res.redirect('/settings')
  } catch (err) {
    console.error(err)
    res.render('database-error')
  }
})

export default routes
