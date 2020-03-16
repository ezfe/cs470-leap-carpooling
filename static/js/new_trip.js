'use strict'

const locationField = document.getElementById('location_field')
const autocomplete = new google.maps.places.Autocomplete(
  locationField,
  {
    types: ['(cities)'],
    componentRestrictions: { country: 'us' }
  }
)

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
  const userRoleValue = document.getElementById('user_role').value
  if (['driver', 'rider'].indexOf(userRoleValue) < 0) {
    event.preventDefault()
    alert('Must select whether you\'re driving or riding')
    return
  }

  const place = autocomplete.getPlace()
  if (!place) {
    alert("There's no place ID set")
    event.preventDefault()
    return
  } else {
    document.getElementById('place_id_field').value = place.place_id
  }
})

document.getElementById('discard_button').addEventListener('click', () => {
  if (confirm('Discard entered information?')) {
    location.href = "/trips"
  }
})