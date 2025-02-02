import { Response, Router } from 'express'
import db from '../../db'
import pairingJob from '../../jobs/pairing-job'
import { ReqAuthedReq } from '../../utils/authed_req'
import { internalError } from '../errors/internal-error'

const routes = Router({ mergeParams: true })

routes.post('/', async (req: ReqAuthedReq, res: Response) => {
  try {
    const unblockID = req.params.userId
    const currentUserID = req.user.id
    await db('pair_rejections')
      .where('blockee_id', unblockID)
      .where('blocker_id', currentUserID)
      .del()

    await pairingJob()

    res.redirect('/settings')
  } catch (err) {
    console.error(err)
    internalError(req, res, 'internal-error')
  }
})

export default routes
