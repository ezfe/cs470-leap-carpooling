import { Response, Router } from 'express'
import db from '../../db'
import { ReqAuthedReq } from '../../utils/authed_req'

const routes = Router({ mergeParams: true })

routes.post('/', async (req: ReqAuthedReq, res: Response) => {
  try {
    const id = req.params.userId
    const currentUser = req.user.id
    await db('pair_rejections').where('blockee_id',id).where('blocker_id', currentUser).del()

     res.redirect('../settings')
  } catch (err) {
    console.error(err)
    res.render('database-error')
  }
})

export default routes
