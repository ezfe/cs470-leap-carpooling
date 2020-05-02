// Get an express router
import { Response, Router } from 'express'
import { format } from 'url'
import xml from 'xml2js'
import { normalize, stripPrefix } from 'xml2js/lib/processors'
import db from '../db'
import { getUserByID, getUserByNetID, setLoggedInAs, setLoggedOut, User } from '../models/users'
import { AuthedReq } from '../utils/authed_req'
import axios from 'axios'
import { internalError } from './errors/internal-error'
import { notFound } from './errors/not-found'

const routes = Router()
const service = process.env.CAS_SERVICE_URL

routes.get('/login', async (req: AuthedReq, res: Response) => {
  if (req.session?.loginRedirect && !req.query.forwarding) {
    delete req.session.loginRedirect
  }

  if (process.env.CAS_DISABLED === 'true') {
    try {
      const users = await db<User>('users')
      const currentUser = req.user
      res.render('sessions/choose_user', { users, currentUser })
    } catch (err) {
      console.error(err)
      internalError(req, res, 'internal-error')
    }
  } else {
    const casURL = format({
      pathname: `https://${process.env.CAS_ENDPOINT}/login`,
      query: {
        service,
      },
    })

    res.redirect(casURL)
  }
})

routes.get('/logout', (req, res) => {
  setLoggedOut(req)

  if (process.env.CAS_DISABLED === 'true') {
    res.redirect('/')
  } else {
    const casURL = format({
      pathname: `https://${process.env.CAS_ENDPOINT}/logout`,
      query: {
        service,
      },
    })
  
    res.redirect(casURL)
  }
})

if (process.env.CAS_DISABLED === 'true') {
  // POST /sessions/login
  routes.post('/login', async (req: AuthedReq, res: Response) => {
    const user = await getUserByID(req.body.chosen_user)
    if (user) {
      setLoggedInAs(req, user)

      if (req.session?.loginRedirect) {
        res.redirect(req.session.loginRedirect)
        delete req.session.loginRedirect
        return
      }

      res.redirect('/')
    } else {
      notFound(req, res)
    }
  })

  // POST /sessions/create-user
  routes.post('/create-user', async (req: AuthedReq, res: Response) => {
    try {
      await db<User>('users').insert({
          netid: req.body.netid,
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          created_at: db.fn.now()
        })
      const user = await getUserByNetID(req.body.netid)
      setLoggedInAs(req, user)
      res.redirect('/')
    } catch (err) {
      console.error(err)
      internalError(req, res, 'internal-error')
    }
  })
} else {
  routes.get('/handle-ticket', async (req: AuthedReq, res: Response) => {
    const requestURL = format({
      pathname: `https://${process.env.CAS_ENDPOINT}/p3/serviceValidate`,
      query: {
        service,
        ticket: req.query.ticket as string,
      },
    })

    try {
      const axiosResponse = await axios.get(requestURL)

      const parsedXML = await xml.parseStringPromise(axiosResponse.data, {
        trim: true,
        normalize: true,
        explicitArray: false,
        tagNameProcessors: [normalize, stripPrefix],
      })

      const failure = parsedXML.serviceresponse.authenticationfailure
      if (failure) {
        console.error('CAS authentication failed (' + failure.$.code + ').')
        internalError(req, res, 'cas')
        return
      }

      const success = parsedXML.serviceresponse.authenticationsuccess
      if (success) {
        const netid = success.user
        const firstName = success.attributes.givenname
        const lastName = success.attributes.surname

        let user = await getUserByNetID(netid)
        if (user) {
          setLoggedInAs(req, user)

          if (req.session?.loginRedirect) {
            delete req.session.loginRedirect
            res.redirect(req.session.loginRedirect)
            return
          }

          res.redirect('/')
          return
        } else {
          const inserted = await db<User>('users').insert({
            netid,
            first_name: firstName,
            last_name: lastName,
            created_at: db.fn.now()
          }).returning<User[]>('*')

          if (inserted.length === 0) {
            console.error('Failed to find or insert new record')
            internalError(req, res, 'internal-error')
            return
          } else {
            user = inserted[0]
          }

          if (user) {
            setLoggedInAs(req, user)
            res.redirect('/settings/onboard')
            return
          } else {
            console.error('Failed to find or insert new record')
            internalError(req, res, 'internal-error')
            return
          }
        }
      }

      console.error('CAS authentication failed.')
      internalError(req, res, 'cas')
    } catch (err) {
      console.error(err)
      internalError(req, res, 'internal-error')
    }

    return
  })
}

export default routes
