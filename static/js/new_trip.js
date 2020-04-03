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

for (const button of document.getElementsByClassName('role_button')) {
  button.addEventListener('click', clickRoleButton) 
}

document.getElementById('reverse_locations').addEventListener('click', (event) => {
  const tripDirectionInput = document.getElementById('trip_direction')
  const lafayetteColumn = document.getElementById('lafayette_column')
  const otherLocationcolumn = document.getElementById('other_loc_column')

  if (tripDirectionInput.value == 'from_lafayette') {
    tripDirectionInput.value = 'towards_lafayette'
    
    lafayetteColumn.classList.add('order-3')
    lafayetteColumn.classList.remove('order-1')
    otherLocationcolumn.classList.add('order-1')
    otherLocationcolumn.classList.remove('order-3')

    document.getElementById('lafayette_loc_header').innerText = 'To'
    document.getElementById('other_loc_header').innerText = 'From'
  } else {
    tripDirectionInput.value = 'from_lafayette'

    lafayetteColumn.classList.add('order-1')
    lafayetteColumn.classList.remove('order-3')
    otherLocationcolumn.classList.add('order-3')
    otherLocationcolumn.classList.remove('order-1')

    document.getElementById('lafayette_loc_header').innerText = 'From'
    document.getElementById('other_loc_header').innerText = 'To'
  }
})

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

  const startDate = document.getElementById('start_date').value

  if(startDate == 'a'){
    alert('Please use a valid start date.')
    return
  }
  /* if(!(moment(startDate, 'MM-DD-YYYY', true))){
    alert('Please use a valid start date.')
    return
  } */

  const endDate = document.getElementById('end_date').value
  if(!(moment(endDate, 'MM-DD-YYYY', true))){
    alert('Please use a valid final date.')
    return
  }
})

document.getElementById('discard_button').addEventListener('click', () => {
  if (confirm('Discard entered information?')) {
    location.href = "/trips"
  }
})