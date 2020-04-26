import { Client } from "@googlemaps/google-maps-services-js"

export async function locationCity(place: string): Promise<{street_number: string, street: string, locality: string, state: string, zip: string}> {
  const placeName = await geocode(place)
  console.log("&&&&&&&&&&&&&&&&&& printing from locationCity &&&&&&&&&&&&&&&&&&&&&&")
  console.log(placeName)
      return placeName
  }


export async function geocode(placeID: string): Promise<{ street_number: string, street: string, locality: string, state: string, zip: string }> {
  console.log(" in geocodeeeeeeeee")
  const googleMapsKey = process.env.GOOGLE_MAPS_ROUTING_KEY
  if (!googleMapsKey) {
    console.error('GOOGLE_MAPS_ROUTING_KEY is not set')
    return {street_number: "", street: "", locality: "", state: "", zip: ""}

  }

  const c = new Client({})
  const response = await c.placeDetails({
    params: {
      key: googleMapsKey,
      place_id: placeID,

    }
  })
const r = response.data.result
const res= response.data.result.address_components
let streetnum =""
let street =""
let locality =""
let state =""
let zip =""
console.log("this is the result!!!!!!!!!!!!!!!!!!")
if(res!=undefined)
  console.log(res)
if(res!=undefined)
  for (let i=0; i<res.length; i++){
        for (let j=0; j<res[i].types.length; j++){
            if (res[i].types[j]=='street_number') streetnum=(res[i].short_name)
            else if (res[i].types[j]=='route') street=(res[i].short_name)
            else if (res[i].types[j]=='locality') locality=(res[i].short_name)
            else if (res[i].types[j]=='administrative_area_level_1') state=(res[i].short_name)
            else if (res[i].types[j]=='postal_code') zip=(res[i].short_name)
        }
      }
    //return "";
  return {street_number: streetnum, street: street, locality: locality, state: state, zip: zip}

}