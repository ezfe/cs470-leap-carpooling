'use strict'

function getMeta(metaName) {
  for (const meta of document.getElementsByTagName('meta')) {
    if (meta.getAttribute('name') === metaName) {
      return meta.getAttribute('content');
    }
  }

  return '';
}

document.getElementById('cancel-trip-form').addEventListener('submit', (evt) => {
  if (!confirm('This will completely remove your trip request and matching.\n\nIf you want to be paired with someone else, stop and click Reject Match instead.')) {
      evt.preventDefault()
    }
})

function initMap() {
  var directionsService = new google.maps.DirectionsService
  var directionsRenderer = new google.maps.DirectionsRenderer
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 6,
    center: {lat: 41.85, lng: -87.65}
  })
  directionsRenderer.setMap(map)

  calculateAndDisplayRoute(directionsService, directionsRenderer)
}

function calculateAndDisplayRoute(directionsService, directionsRenderer) {
  directionsService.route({
    origin: `place_id:${getMeta('firstPlaceID')}`,
    destination: `place_id:${getMeta('lastPlaceID')}`,
    waypoints: [{ location: `place_id:${getMeta('midPlaceID')}` }],
    optimizeWaypoints: false,
    travelMode: 'DRIVING'
  }, (response, status) => {
    if (status === 'OK') {
      directionsRenderer.setDirections(response);
    } else {
      window.alert('Directions request failed due to ' + status);
    }
  });
}