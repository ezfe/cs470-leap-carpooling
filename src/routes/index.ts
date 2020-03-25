import { Response, Router, static as expressStatic } from 'express'
import path from 'path'
import { AuthedReq } from '../utils/authed_req'
import trips from './trips'
import sessions from './sessions'
import settings from './settings'
import { requireAuthenticated } from '../middleware/auth'

const routes = Router()

routes.use('/static', expressStatic(path.join(__dirname, '../../static')))

routes.use('/trips', requireAuthenticated, trips)
routes.use('/sessions', sessions)
routes.use('/settings', settings)

// This would be the home page
routes.get('/', async (req: AuthedReq, res: Response) => {
  res.render('homepage')
})

export default routes