function myMap() {
  var directionsService = new google.maps.DirectionsService;
  var directionsDisplay = new google.maps.DirectionsRenderer;
  var mapProp= {center:new google.maps.LatLng(51.508742,-0.120850),zoom:5,};
  var map = new google.maps.Map(document.getElementById("googleMap"),mapProp);

  directionsDisplay.setMap(map);
  calculateAndDisplayRoute(directionsService, directionsDisplay);
}

function calculateAndDisplayRoute(directionsService, directionsDisplay){
  var start_pt = document.getElementById('driver_location').textContent;
  start_pt = start_pt.replace(/,/g, "");
  var pickup_pt = document.getElementById('rider_location').textContent;
  pickup_pt = pickup_pt.replace(/,/g, "");
  console.log("start point:" + start_pt);
  //var stop_pt = document.getElementById('first_date').value
  var waypts = [];
  waypts.push({location: ("" + pickup_pt)});
  directionsService.route({
    origin: (""+start_pt),
    destination: (""+document.getElementById('laf_location').textContent),
    waypoints: waypts,
    travelMode: 'DRIVING'
  }, function(response, status){
    if (status === 'OK'){
      directionsDisplay.setDirections(response);
    }else{
      window.alert('Directions request failed due to ' + status);
    }
  });
}