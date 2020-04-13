'use strict'

import getMeta from './getMeta.js'

document.getElementById('cancel-trip-form').addEventListener('submit', (evt) => {
  if (!confirm('This will completely remove your trip request and matching.\n\nIf you want to be paired with someone else, stop and click Reject Match instead.')) {
      evt.preventDefault()
    }
})

let directionsService = new google.maps.DirectionsService
let directionsRenderer = new google.maps.DirectionsRenderer
let map = new google.maps.Map(document.getElementById('map'), {
  zoom: 6,
  center: {lat: 41.85, lng: -87.65}
})
directionsRenderer.setMap(map)

const firstPlaceID = getMeta('firstPlaceID')
const lastPlaceID = getMeta('lastPlaceID')
const midPlaceID = getMeta('midPlaceID')

let options = {
  origin: { placeId: firstPlaceID },
  destination: { placeId: lastPlaceID },
  optimizeWaypoints: false,
  travelMode: 'DRIVING'
}

if (midPlaceID != lastPlaceID && midPlaceID != firstPlaceID) {
  options.waypoints = [{ location: { placeId: getMeta('midPlaceID') }}]
}

console.log(options)

directionsService.route(options, (response, status) => {
  if (status === 'OK') {
    directionsRenderer.setDirections(response);
  } else {
    window.alert('Directions request failed due to ' + status);
  }
})
