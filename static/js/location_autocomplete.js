'use strict'

function registerAutocomplete(locationFieldID, placeFieldID) {
  const locationField = document.getElementById(locationFieldID)
  const placeField = document.getElementById(placeFieldID)

  const autocomplete = new google.maps.places.Autocomplete(
    locationField,
    {
      // types: ['(cities)'],
      componentRestrictions: { country: 'us' }
    }
  )

  locationField.addEventListener('keyup', () => {
    placeField.value = '';
  })

  const formSync = () => {
    const place = autocomplete.getPlace()
    if (place) {
      placeField.value = place.place_id
      locationField.value = place.formatted_address
    }

    return placeField.value.trim().length == 0
  }
  
  return formSync
}
