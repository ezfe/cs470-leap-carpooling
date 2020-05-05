import asyncRedis from 'async-redis'

/*
  This file creates the redis client used
  by the rest of the project
*/

const redisClient = asyncRedis.createClient()
redisClient.on('error', (err) => {
  console.error('Redis Error: ' + err)
})

export default redisClient
