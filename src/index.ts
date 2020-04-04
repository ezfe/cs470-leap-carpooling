// import { Request, Response, Application } from 'express';
import express = require('express');
import dotenv = require('dotenv')
import routes from './routes'
import bodyParser = require('body-parser')
import session from 'express-session'
import { authenticateUser } from './middleware/auth'
import registerJobs from './jobs'
import CASAuthentication from 'express-cas-authentication'

/* Load environment variables from .env file */
dotenv.config()

/* Express Setup */
const app = express()

const cas = new CASAuthentication({
  cas_url: 'https://cas.lafayette.edu/cas',
  service_url: 'https://artful.cs.lafayette.edu'
})

if (!process.env.SESSION_SECRET) {
  console.log('Set SESSION_SECRET=(SOME RANDOM SECRET VALUE) in .env!')
  process.exit(1)
}
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 604800000 } // 7 days
}))

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(cas.bounce)
app.use(authenticateUser)

app.use('/public/uploads', express.static('public/uploads'));

registerJobs()

app.set('view engine', 'pug')
app.use('/', routes)

app.listen(80, () => {
  console.log('Example app listening on port 8000!')
})
