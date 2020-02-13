const express = require('express')
const { Pool } = require('pg')
require('dotenv').config()

/* Postgres Setup */
const pool = new Pool()

/* Express Setup */
const app = express()

app.get('/', async (req, res) => {
  const client = await pool.connect()
  try {
    const response = await client.query('SELECT NOW()')
    res.send(JSON.stringify(response.rows[0]))
  } finally {
    client.release()
  }
})

app.listen(8000, () => {
  console.log('Example app listening on port 8000!')
})
