import { Client } from '@googlemaps/google-maps-services-js'
import redisClient from '../db/redis'
import { TripDirection } from '../models/misc_types'
import { lafayettePlaceID } from './places'

/**
 * Compute the distance matrix concerning a driver, rider, and direction
 * @param driverPlace The driver's location
 * @param riderPlace The rider's location
 * @param direction The direction to or from Lafayette
 * @returns The cost the driver or the rider must spend to complete the trip as a pair
 */
export async function distanceMatrix(
  driverPlace: string, riderPlace: string, direction: TripDirection): Promise<{
    riderCost: number,
    driverCost: number
  }> {

  if (direction === 'towards_lafayette') {
    const driverBaseCost = await timeBetween(driverPlace, lafayettePlaceID)
    const driverToRider = await timeBetween(driverPlace, riderPlace)
    const riderToLafayette = await timeBetween(riderPlace, lafayettePlaceID)

    const driverCost = (driverToRider + riderToLafayette) - (driverBaseCost)
    const riderCost = await timeBetween(riderPlace, driverPlace)

    return {
      driverCost,
      riderCost
    }
  } else {
    const driverBaseCost = await timeBetween(lafayettePlaceID, driverPlace)
    const riderToDriver = await timeBetween(riderPlace, driverPlace)
    const lafayetteToRider = await timeBetween(lafayettePlaceID, riderPlace)

    const driverCost = (lafayetteToRider + riderToDriver) - (driverBaseCost)
    const riderCost = await timeBetween(driverPlace, riderPlace)

    return {
      driverCost,
      riderCost
    }
  }
}

/**
 * Calculate the time to travel between two places
 * @param originPlace The starting location
 * @param destinationPlace The ending location
 * @returns The time in minutes to travel between the two places
 */
export async function timeBetween(originPlace, destinationPlace): Promise<number> {
  const googleMapsKey = process.env.GOOGLE_MAPS_ROUTING_KEY
  if (!googleMapsKey) {
    console.error('GOOGLE_MAPS_ROUTING_KEY is not set')
    // Without a routing key, can treat all numbers as infinite
    // No trips can be compiled like this, unfortunately
    // but there's no other way to do this
    return Infinity
  }

  const redisKey = `time_placeid:${originPlace}_placeid:${destinationPlace}`

  const redisFoundValue = await redisClient.get(redisKey)
  if (redisFoundValue) {
    return parseInt(redisFoundValue, 10) / 60
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

  return time / 60
}