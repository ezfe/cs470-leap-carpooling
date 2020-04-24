import { Client } from "@googlemaps/google-maps-services-js"

export async function locationCity(place: string): Promise<{city: string}> {
  const driverBaseCost = await geocode(place)
      return {city:place}
  }


export async function geocode(placeID: string): Promise<{ city: string, state: string, address: string }> {
  console.log(" in geocodeeeeeeeee")
  const googleMapsKey = process.env.GOOGLE_MAPS_ROUTING_KEY
  if (!googleMapsKey) {
    console.error('GOOGLE_MAPS_ROUTING_KEY is not set')
    return {city:"", state:"", address:""}
  }

  // const redisKey = `placeid:${placeID}`

  // const redisFoundValue = await redisClient.get(redisKey)
  // if (redisFoundValue) {
  //   return 
  // }

  const c = new Client({})
  const response = await c.placeDetails({
    params: {
      key: googleMapsKey,
      place_id: placeID
    }
  })
const result = response.data
console.log("this is the result!!!!!!!!!!!!!!!!!!")
console.log(result)
  return {city:"", state:"", address:""}

}