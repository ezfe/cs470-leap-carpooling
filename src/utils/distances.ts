import { Client } from "@googlemaps/google-maps-services-js"
import redisClient from "../db/redis"

export async function distanceMatrix(driverPlace: string, riderPlace: string, toLafayette: boolean) {
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

export async function timeBetween(originPlace, destinationPlace): Promise<number> {
  const googleMapsKey = process.env.GOOGLE_MAPS_ROUTING_KEY
  if (!googleMapsKey) {
    console.error('GOOGLE_MAPS_ROUTING_KEY is not set')
    return null
  }
  const redisKey = `time_placeid:${originPlace}_placeid:${destinationPlace}`

  const redisFoundValue = await redisClient.get(redisKey)
  if (redisFoundValue) {
    return parseInt(redisFoundValue, 10)
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

  const time: number = response.data.rows[0].elements[0].duration.value
  await redisClient.set(redisKey, time)
  await redisClient.expire(redisKey, 604800) // 1 week

  return time
}