import { Response, Router } from 'express'
import { AuthedReq } from '../utils/authed_req'

const routes = Router()

routes.get('/', async (req: AuthedReq, res: Response) => {
  res.render('help')
})

export default routes