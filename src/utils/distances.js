const Client = require('@googlemaps/google-maps-services-js').Client

// Shared place is Lafayette College, but this doesn't care
async function distanceMatrix(driverPlace, riderPlace, direction) {
  const lafayettePlace = 'ChIJAZll2E5sxIkRmWtHcAi0le4'

  if (direction == 'towards_lafayette') {
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
  const c = new Client({})
  const response = await c.distancematrix({
    params: {
      key: process.env.GOOGLE_MAPS_ROUTING_KEY,
      origins: [
        `place_id:${originPlace}`
      ],
      destinations: [
        `place_id:${destinationPlace}`
      ]
    }
  })
  // console.log(JSON.stringify(response.data.rows))
  // console.log(response.data.rows[0].elements[0].duration.value)
  return response.data.rows[0].elements[0].duration.value
}

module.exports = distanceMatrix
