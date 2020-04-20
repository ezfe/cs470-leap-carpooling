import { Response, Router, static as expressStatic } from 'express'
import path from 'path'
import { requireAuthenticated } from '../middleware/auth'
import { AuthedReq } from '../utils/authed_req'
import sessions from './sessions'
import settings from './settings'
import tripRequestDetail from './trip-requests/detail'
import trips from './trips'

const routes = Router()

routes.use('/static', expressStatic(path.join(__dirname, '../../static')))

routes.use('/trips', requireAuthenticated, trips)
routes.use('/trip-requests/:requestID', requireAuthenticated, tripRequestDetail)
routes.use('/sessions', sessions)
routes.use('/settings', requireAuthenticated, settings)

// This would be the home page
routes.get('/', async (req: AuthedReq, res: Response) => {
  res.render('homepage')
})
routes.get('/about', async (req: AuthedReq, res: Response) => {
  res.render('about')
})
export default routes