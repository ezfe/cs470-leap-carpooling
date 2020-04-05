// Get an express router
import { Response, Router } from 'express'
import { format } from 'url'
import xml from 'xml2js'
import { normalize, stripPrefix } from 'xml2js/lib/processors'
import db from '../db'
import { getUserByID, getUserByNetID, setLoggedInAs, setLoggedOut, User } from '../models/users'
import { AuthedReq } from '../utils/authed_req'
import axios from 'axios'

const routes = Router()
const service = 'https://carpool.cs.lafayette.edu/sessions/handle-ticket'

routes.get('/login', async (req: AuthedReq, res: Response) => {
  if (process.env.CAS_ENABLED === "true") {
    const casURL = format({
      pathname: 'https://cas.lafayette.edu/cas/login',
      query: {
          service
      }
    })

    res.redirect(casURL)
  } else {
    try {
      const users = await db<User>('users')
      const currentUser = req.user
      res.render('sessions/choose_user', { users, currentUser })
    } catch (err) {
      res.render('database-error')
    }
  }
})

routes.get('/logout', (req, res) => {
  setLoggedOut(req)
  res.redirect('/')
})

routes.post('/login', async (req: AuthedReq, res: Response) => {
  const user = await getUserByID(req.body.chosen_user)
  if (user) {
    setLoggedInAs(req, user)

    const key = parseInt(req.query.next, 10)
    if (req.session?.loginRedirect?.key === key && req.session?.loginRedirect.value) {
      res.redirect(req.session.loginRedirect.value)
      return
    }

    res.redirect('/')
  } else {
    res.send('User not found')
  }
})

routes.get('/handle-ticket', async (req: AuthedReq, res: Response) => {
  const requestURL = format({
    pathname: 'https://cas.lafayette.edu/cas/p3/serviceValidate',
    query: {
        service,
        ticket: req.query.ticket
    }
  })

  try {
    const axiosResponse = await axios.get(requestURL)

    const parsedXML = await xml.parseStringPromise(axiosResponse.data, {
      trim: true,
      normalize: true,
      explicitArray: false,
      tagNameProcessors: [ normalize, stripPrefix ]
    })

    const failure = parsedXML.serviceresponse.authenticationfailure
    if (failure) {
      console.error('CAS authentication failed (' + failure.$.code + ').')
      res.sendStatus(401)
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

        const key = parseInt(req.query.next, 10)
        if (req.session?.loginRedirect?.key === key && req.session?.loginRedirect.value) {
          res.redirect(req.session.loginRedirect.value)
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
          res.render('database-error')
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
          res.render('database-error')
          return
        }
      }
    }

    console.error('CAS authentication failed.')
    res.sendStatus(401)
  } catch (err) {
    console.error(err)
    res.sendStatus(500)
  }

  return
})

// POST /sessions/create-user
routes.post('/create-user', async (req: AuthedReq, res: Response) => {
  try {
    await db<User>('users').insert({
      })
    const user = await getUserByNetID(req.body.netid)
    setLoggedInAs(req, user)
    res.redirect('/')
  } catch (err) {
    res.render('database-error')
  }
})

export default routes
