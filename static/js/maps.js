'use strict'

import getMeta from './getMeta.js'

function myMap() {
  var directionsService = new google.maps.DirectionsService;
  var directionsDisplay = new google.maps.DirectionsRenderer;
  var mapProp= {center:new google.maps.LatLng(51.508742,-0.120850),zoom:5,};
  var map = new google.maps.Map(document.getElementById("googleMap"),mapProp);

  directionsDisplay.setMap(map);
  calculateAndDisplayRoute(directionsService, directionsDisplay);
}

function calculateAndDisplayRoute(directionsService, directionsDisplay){
  const firstPlaceID = getMeta('firstPlaceID')
  const lastPlaceID = getMeta('lastPlaceID')
  const midPlaceID = getMeta('midPlaceID')

  directionsService.route({
    origin: { placeId: firstPlaceID },
    destination: { placeId: lastPlaceID },
    waypoints: [{ location: { placeId: getMeta('midPlaceID') }}],
    optimizeWaypoints: false,
    travelMode: 'DRIVING'
  }, function(response, status){
    if (status === 'OK'){
      directionsDisplay.setDirections(response);
    }else{
      window.alert('Directions request failed due to ' + status);
    }
  });
}