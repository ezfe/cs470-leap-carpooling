import { Response, Router } from 'express'
import { AuthedReq } from '../utils/authed_req'
import { preferredEmail } from '../validation'

const routes = Router()

routes.get('/', async (req: AuthedReq, res: Response) => {
  const userEmail = (req.user) ? req.user.email : ''
  res.render('help', { userEmail, preferredEmail })
})

routes.post('/', async (req: AuthedReq, res: Response) => {
  res.redirect('/help')
})

export default routes