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

function clickRoleButton(event) {
  for (const button of document.getElementsByClassName('role_button')) {
    button.classList.remove('active')
    button.setAttribute('aria-pressed', 'false')
  }
  event.target.classList.add('active')
  event.target.setAttribute('aria-pressed', 'true')
  document.getElementById('user_role').value = event.target.value
}

for (const button of document.getElementsByClassName('role_button')) {
  button.addEventListener('click', clickRoleButton) 
}

document.getElementById('request_form').addEventListener('submit', (event) => {
  const placeID = autocomplete.getPlace().place_id
  if (!placeID) {
    event.preventDefault()
    alert("There's no place ID set")
  } else {
    document.getElementById('place_id_field').value = placeID
  }

  
})
