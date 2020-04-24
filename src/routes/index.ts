import { Response, Router, static as expressStatic } from 'express'
import path from 'path'
import { requireAuthenticated } from '../middleware/auth'
import { AuthedReq } from '../utils/authed_req'
import sessions from './sessions'
import settings from './settings'
import tripRequestDetail from './trip-requests/detail'
import trips from './trips'
import help from './help'
import unblockUser from './unblock-user'

const routes = Router()

routes.use('/static', expressStatic(path.join(__dirname, '../../static')))

routes.use('/trips', requireAuthenticated, trips)
routes.use('/trip-requests/:requestID', requireAuthenticated, tripRequestDetail)
routes.use('/sessions', sessions)
routes.use('/settings', requireAuthenticated, settings)
routes.use('/help', help)
routes.use('/unblock-user/:userId', requireAuthenticated, unblockUser)

// This would be the home page
routes.get('/', async (req: AuthedReq, res: Response) => {
  const siteName = process.env.SITE_NAME
  const contactEmail = process.env.CONTACT_EMAIL
  res.render('homepage', { siteName, contactEmail })
})
routes.get('/about', async (req: AuthedReq, res: Response) => {
  const siteName = process.env.SITE_NAME
  const contactEmail = process.env.CONTACT_EMAIL
  res.render('about', { siteName, contactEmail })
})
export default routes