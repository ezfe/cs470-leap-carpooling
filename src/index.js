const express = require('express')
const dotenv = require('dotenv')
const routes = require('./routes')
const bodyParser = require('body-parser')
const session = require('express-session')

/* Load environment variables from .env file */
dotenv.config()

/* Express Setup */
const app = express()

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 60000 }
}))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.set('view engine', 'pug')
app.use('/', routes)

app.listen(8000, () => {
  console.log('Example app listening on port 8000!')
})
