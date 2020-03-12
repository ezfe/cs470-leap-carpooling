'use strict'

const locationField = document.getElementById('location_field')
const autocomplete = new google.maps.places.Autocomplete(
  locationField,
  {
    types: ['(cities)'],
    componentRestrictions: { country: 'us' }
  }
)

// autocomplete.addListener('place_changed', () => {
//   console.log(autocomplete.getPlace())
// })

document.getElementById('request_form').addEventListener('submit', (event) => {
  const placeID = autocomplete.getPlace().place_id
  if (!placeID) {
    event.preventDefault()
    alert("There's no place ID set")
  } else {
    document.getElementById('place_id_field').value = placeID
  }
})
