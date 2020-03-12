// import { Request, Response, Application } from 'express';
import express = require('express');
import dotenv = require('dotenv')
import routes from './routes'
import bodyParser = require('body-parser')
import session from 'express-session'
import { authenticateUser } from './middleware/auth'
import registerJobs from './jobs'

/* Load environment variables from .env file */
dotenv.config()

/* Express Setup */
const app = express()

if (!process.env.SESSION_SECRET) {
  console.log('Set SESSION_SECRET=(SOME RANDOM SECRET VALUE) in .env!')
  process.exit(1)
}
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 60000 }
}))

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(authenticateUser)

registerJobs()

app.set('view engine', 'pug')
app.use('/', routes)

app.listen(8000, () => {
  console.log('Example app listening on port 8000!')
})
