import { Response, Router } from 'express'
import { AuthedReq } from '../utils/authed_req'
import { preferredEmail } from '../validation'
import { sendMessage } from '../utils/emails'

const routes = Router()

routes.get('/', async (req: AuthedReq, res: Response) => {  
  const siteName = process.env.SITE_NAME
  const contactEmail = process.env.CONTACT_EMAIL
  const userEmail = (req.user) ? req.user.email : ''
  const alertDisplay = 'none'
  res.render('help', { siteName, contactEmail, userEmail, preferredEmail, alertDisplay })
})

routes.post('/', async (req: AuthedReq, res: Response) => {
  sendMessage(req.body.email, req.body.subject, req.body.message)
  const siteName = process.env.SITE_NAME
  const contactEmail = process.env.CONTACT_EMAIL
  const userEmail = (req.user) ? req.user.email : ''
  const alertDisplay = 'block'
  res.render('help', { siteName, contactEmail, userEmail, preferredEmail, alertDisplay })
})

export default routes