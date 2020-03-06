const express = require('express')
const dotenv = require('dotenv')
const routes = require('./routes')
var bodyParser = require('body-parser')

/* Load environment variables from .env file */
dotenv.config()

/* Express Setup */
const app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.set('view engine', 'pug')
app.use('/', routes)

app.listen(8000, () => {
  console.log('Example app listening on port 8000!')
})
