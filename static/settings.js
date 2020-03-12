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
  const placeID = autocomplete.getPlace().place_id
  if (!placeID) {
    event.preventDefault()
    alert("There's no place ID set")
  } else {
    document.getElementById('place_id_field').value = placeID
  }
})
