import { Response, Router } from 'express'
import { AuthedReq } from '../utils/authed_req'
import { preferredEmail } from '../validation'
import { sendMessage } from '../utils/emails'

const routes = Router()

routes.get('/', async (req: AuthedReq, res: Response) => {  
  const userEmail = (req.user) ? req.user.email : ''
  const alertDisplay = 'none'
  res.render('help', { userEmail, preferredEmail, alertDisplay })
})

routes.post('/', async (req: AuthedReq, res: Response) => {
  sendMessage(req.body.email, req.body.subject, req.body.message)
  const userEmail = (req.user) ? req.user.email : ''
  const alertDisplay = 'block'
  res.render('help', { userEmail, preferredEmail, alertDisplay })
})

export default routes
