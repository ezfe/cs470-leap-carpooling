'use strict'

function verifyValidity(autocomplete, field) {
  if (autocomplete.getPlace()) {
    console.log('Still finding a place')
    field.removeAttribute('pattern')
  } else {
    field.setAttribute('pattern', '\\b')
  }
}

export default function registerAutocomplete(locationFieldID, placeFieldID) {
  const locationField = document.getElementById(locationFieldID)
  const placeField = document.getElementById(placeFieldID)

  const autocomplete = new google.maps.places.Autocomplete(
    locationField,
    {
      // types: ['(cities)'],
      componentRestrictions: { country: 'us' }
    }
  )

  autocomplete.addListener('place_changed', () => {
    verifyValidity(autocomplete, document.getElementById('location_field'))
  })


  locationField.addEventListener('keyup', () => {
    placeField.value = '';

    verifyValidity(autocomplete, document.getElementById('location_field'))
  })

  const formSync = () => {
    const place = autocomplete.getPlace()
    if (place) {
      placeField.value = place.place_id
      locationField.value = place.formatted_address
    }

    return placeField.value.trim().length > 0
  }
  
  return formSync
}
