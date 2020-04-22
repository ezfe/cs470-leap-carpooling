import { Response, Router } from 'express'
import db from '../../db'
import { ReqAuthedReq } from '../../utils/authed_req'

const routes = Router({ mergeParams: true })

routes.post('/unblock', async (req: ReqAuthedReq, res: Response) => {
  try {
    const id = parseInt(req.params.requestID, 10)
    console.log("we in")
    const blocked = await db('pair_rejections').where({ id }).first()

    // if (!tripRequest) {
    //   res.sendStatus(404)
    //   return
    // }

    await db('pair_rejections').where('id', blocked.id).del()

     res.redirect('/trips?delete=success')
  } catch (err) {
    console.error(err)
    res.render('database-error')
  }
})

export default routes