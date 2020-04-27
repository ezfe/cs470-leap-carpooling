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
import { notFound } from './errors/not-found'

const routes = Router()

routes.use('/static', expressStatic(path.join(__dirname, '../../static')))

// Authenticated Pages
routes.use('/trips', requireAuthenticated, trips)
routes.use('/trip-requests/:requestID', requireAuthenticated, tripRequestDetail)
routes.use('/settings', requireAuthenticated, settings)
routes.use('/unblock-user/:userId', requireAuthenticated, unblockUser)

// Possibly Unauthenticated Pages
routes.use('/sessions', sessions)
routes.use('/help', help)

// Homepage
routes.get('/', async (req: AuthedReq, res: Response) => {
  res.render('homepage')
})

// About Page
routes.get('/about', async (req: AuthedReq, res: Response) => {
  res.render('about')
})

// 404 Page
routes.use(notFound)

export default routes
