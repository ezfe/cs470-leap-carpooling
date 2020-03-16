var displayPhoto = function(event) {
  var image = document.getElementById('uploadedPhoto')
  image.src = URL.createObjectURL(event.target.files[0])
}

const locationField = document.getElementById('location_field')
const autocomplete = new google.maps.places.Autocomplete(
  locationField,
  {
    componentRestrictions: { country: 'us' }
  }
)

document.getElementById('request_form').addEventListener('submit', (event) => {
  const place = autocomplete.getPlace()
  if (!place) {
    event.preventDefault()
    alert("There's no place ID set")
  } else {
    document.getElementById('location_field').value = place.formatted_address
    document.getElementById('place_id_field').value = place.place_id
  }
})
