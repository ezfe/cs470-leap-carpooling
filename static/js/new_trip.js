'use strict'

const formSync = registerAutocomplete('location_field', 'place_id_field')

function setClicked(button) {
  button.classList.add('active')
  button.setAttribute('aria-pressed', 'true')
}

function setUnclicked(button) {
  button.classList.remove('active')
  button.setAttribute('aria-pressed', 'false')
}


function clickRoleButton(event) {
  for (const button of document.getElementsByClassName('role_button')) {
    setUnclicked(button)
  }
  setClicked(event.target)
  document.getElementById('user_role').value = event.target.value
}

function clickTimeButton(event) {
  for (const button of document.getElementsByClassName('time_button')) {
    setUnclicked(button)
  }
  setClicked(event.target)
  document.getElementById('time').value = event.target.value
}

for (const button of document.getElementsByClassName('role_button')) {
  button.addEventListener('click', clickRoleButton) 
}

for (const button of document.getElementsByClassName('time_button')) {
  button.addEventListener('click', clickTimeButton) 
}

document.getElementById('request_form').addEventListener('submit', (event) => {
  const userRoleValue = document.getElementById('user_role').value
  if (['driver', 'rider'].indexOf(userRoleValue) < 0) {
    event.preventDefault()
    alert('Must select whether you\'re driving or riding')
    return
  }

  if (!formSync()) {
    alert("No Place ID!")
    event.preventDefault()
    return
  }
})

document.getElementById('discard_button').addEventListener('click', () => {
  if (confirm('Discard entered information?')) {
    location.href = "/trips"
  }
})