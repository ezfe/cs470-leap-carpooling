const Client = require('@googlemaps/google-maps-services-js').Client

const asyncRedis = require('async-redis')
const client = asyncRedis.createClient()
client.on('error', function (err) {
  console.error('Redis Error: ' + err)
})

// Shared place is Lafayette College, but this doesn't care
async function distanceMatrix(driverPlace, riderPlace, toLafayette) {
  const lafayettePlace = 'ChIJAZll2E5sxIkRmWtHcAi0le4'

  if (toLafayette) {
    const driverBaseCost = await timeBetween(driverPlace, lafayettePlace)
    const driverToRider = await timeBetween(driverPlace, riderPlace)
    const riderToLafayette = await timeBetween(riderPlace, lafayettePlace)

    const driverCost = (driverToRider + riderToLafayette) - (driverBaseCost)
    const riderCost = await timeBetween(riderPlace, driverPlace)

    return {
      driverCost,
      riderCost
    }
  } else {
    const driverBaseCost = await timeBetween(lafayettePlace, driverPlace)
    const riderToDriver = await timeBetween(riderPlace, driverPlace)
    const lafayetteToRider = await timeBetween(lafayettePlace, riderPlace)

    const driverCost = (lafayetteToRider + riderToDriver) - (driverBaseCost)
    const riderCost = await timeBetween(driverPlace, riderPlace)

    return {
      driverCost,
      riderCost
    }
  }
}

async function timeBetween(originPlace, destinationPlace) {
  const googleMapsKey = process.env.GOOGLE_MAPS_ROUTING_KEY
  if (!googleMapsKey) {
    console.error('GOOGLE_MAPS_ROUTING_KEY is not set')
    return null
  }
  const redisKey = `time_placeid:${originPlace}_placeid:${destinationPlace}`

  const redisFoundValue = await client.get(redisKey)
  if (redisFoundValue) {
    return parseInt(redisFoundValue)
  }

  const c = new Client({})
  const response = await c.distancematrix({
    params: {
      key: googleMapsKey,
      origins: [
        `place_id:${originPlace}`
      ],
      destinations: [
        `place_id:${destinationPlace}`
      ]
    }
  })
  const time = parseInt(response.data.rows[0].elements[0].duration.value)
  await client.set(redisKey, time)
  await client.expire(redisKey, 604800) // 1 week

  return time
}

module.exports = distanceMatrix
