const express = require('express')
const dotenv = require('dotenv')
const routes = require('./routes')

/* Load environment variables from .env file */
dotenv.config()

/* Express Setup */
const app = express()

app.use('/', routes)

app.listen(8000, () => {
  console.log('Example app listening on port 8000!')
})
