import { Client } from '@googlemaps/google-maps-services-js'
import redisClient from '../db/redis'

interface GeocodeResult {
  street_number: string | null
  street: string | null
  locality: string | null
  state: string | null
  zip: string | null
}

export async function geocode(placeID: string): Promise<GeocodeResult> {
  const data: GeocodeResult = {
    street_number: null,
    street: null,
    locality: null,
    state: null,
    zip: null,
  }

  const googleMapsKey = process.env.GOOGLE_MAPS_ROUTING_KEY
  if (!googleMapsKey) {
    console.error('GOOGLE_MAPS_ROUTING_KEY is not set')
    return data
  }

  const redisKey = `geocode_placeid:${placeID}`
  const redisFoundValue = await redisClient.get(redisKey)
  if (redisFoundValue) {
    return JSON.parse(redisFoundValue)
  }

  const c = new Client({})
  const response = await c.placeDetails({
    params: {
      key: googleMapsKey,
      place_id: placeID,
    },
  })

  const res = response.data.result.address_components
  if (res) {
    for (let i = 0; i < res.length; i++) {
      for (let j = 0; j < res[i].types.length; j++) {
        if (res[i].types[j] == 'street_number') {
          data.street_number = res[i].short_name
        } else if (res[i].types[j] == 'route') {
          data.street = res[i].short_name
        } else if (res[i].types[j] == 'locality') {
          data.locality = res[i].short_name
        } else if (res[i].types[j] == 'administrative_area_level_1') {
          data.state = res[i].short_name
        } else if (res[i].types[j] == 'postal_code') {
          data.zip = res[i].short_name
        }
      }
    }
  }

  await redisClient.set(redisKey, JSON.stringify(data))
  await redisClient.expire(redisKey, 604800) // 1 week

  return data
}
