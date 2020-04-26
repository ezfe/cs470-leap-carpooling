import asyncRedis from 'async-redis'

const redisClient = asyncRedis.createClient()
redisClient.on('error', (err) => {
  console.error('Redis Error: ' + err)
})

export default redisClient
