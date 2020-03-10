const Client = require('@googlemaps/google-maps-services-js').Client

// Shared place is Lafayette College, but this doesn't care
async function distanceMatrix(driverPlace, riderPlace, toLafayette) {
  const lafayetteCollege = 'ChIJAZll2E5sxIkRmWtHcAi0le4'
  const c = new Client({})
  // driver-lafayette
  // rider-lafayette
  // driver-rider
  // rider-driver
  const response = await c.distancematrix()
}

module.exports = distanceMatrix
