// import { Request, Response, Application } from 'express';
import express = require('express')
import dotenv = require('dotenv')
import routes from './routes'
import bodyParser = require('body-parser')
import session from 'express-session'
import { authenticateUser } from './middleware/auth'
import { addVariables } from './middleware/vars'
import registerJobs from './jobs'

/* Load environment variables from .env file */
dotenv.config()

/* Express Setup */
const app = express()

if (!process.env.SESSION_SECRET) {
  console.error('SESSION_SECRET must be set')
  console.error('It should be a random value (used to sign session data)')
  console.error('Use .env file to configure environment variables')
  process.exit(1)
}

if (!process.env.CONTACT_EMAIL || !process.env.SITE_NAME) {
  console.error('CONTACT_EMAIL and SITE_NAME must be set')
  console.error('Use .env file to configure environment variables')
  process.exit(1)
}

if (process.env.CAS_DISABLED !== 'true') {
  if (!process.env.CAS_ENDPOINT || !process.env.CAS_SERVICE_URL) {
    console.error('CAS_ENDPOINT and CAS_SERVICE_URL must be set when CAS_DISABLED is not set to `true`')
    console.error('Use .env file to configure environment variables')
    process.exit(1)  
  }
}

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 604800000 }, // 7 days
  })
)

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(authenticateUser)
app.use(addVariables)

app.use('/public/uploads', express.static('public/uploads'))

registerJobs()

app.set('view engine', 'pug')
app.use('/', routes)

app.listen(8000, () => {
  console.log('Example app listening on port 8000!')
})
