const express = require('express')
const dotenv = require('dotenv')
const routes = require('./routes')
const bodyParser = require('body-parser')
const session = require('express-session')
const { authenticateUser } = require('./middleware/auth')
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

app.set('view engine', 'pug')
app.use('/', routes)

app.listen(8000, () => {
  console.log('Example app listening on port 8000!')
})
