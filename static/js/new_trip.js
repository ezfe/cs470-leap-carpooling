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



document.getElementById('discard_button').addEventListener('click', () => {
  if (confirm('Discard entered information?')) {
    location.href = "/trips"
  }
})

$(document).ready(function(){
  const options = {
    format: 'mm/dd/yyyy',
    autoclose: true,
    startDate: new Date()
  }

  $('input[name="first_date"]').datepicker(options)
  $('input[name="last_date"]').datepicker(options)
})

$('#first_date').on('changeDate', function(e) {
  //check if the first date is after the last date, if it exists
  var first_date_array = document.getElementById('first_date').value.split("/");
  var last_date_array = document.getElementById('last_date').value.split("/");

  if(last_date_val == ""){
    return;
  }

  var first_date_val = new Date();
  first_date_val.setFullYear(first_date_array[2],first_date_array[0], first_date_array[1]);
  var last_date_val = new Date();
  last_date_val.setFullYear(last_date_array[2], last_date_array[0], last_date_array[1]);

  if(first_date_val > last_date_val){
    alert("Please choose a valid first travel date.")
    $('#first_date').datepicker('clearDates');
  }
  $('#last_date').datepicker('setStartDate', $('#first_date').val())
});

$('#last_date').on('changeDate', function(e) {
  //check if the first date is after the last date, if it exists
  var first_date_array = document.getElementById('first_date').value.split("/");
  var last_date_array = document.getElementById('last_date').value.split("/");;

  if(first_date_val == ""){
    return;
  }

  var first_date_val = new Date();
  first_date_val.setFullYear(first_date_array[2],first_date_array[0], first_date_array[1]);
  var last_date_val = new Date();
  last_date_val.setFullYear(last_date_array[2], last_date_array[0], last_date_array[1]);

  if(first_date_val > last_date_val){
    alert("Please choose a valid last travel date.")
    $('#last_date').datepicker('clearDates');
  }
  $('#first_date').datepicker('setEndDate', $('#last_date').val())
  console.log(first_date_val)
});

document.getElementById('request_form').addEventListener('submit', (event) => {
  const userRoleValue = document.getElementById('user_role').value
  if (['driver', 'rider'].indexOf(userRoleValue) < 0) {
    event.preventDefault()
    alert('Must select whether you\'re driving or riding')
    return
  }

  if (!formSync()) {
    alert('Please enter a valid location')
    event.preventDefault()
    return
  }
  const first_date = document.getElementById('first_date').value
  if(first_date == ""){
    alert('Please enter a valid date for the START of your desired travel range')
    event.preventDefault()
    return
  }
  const last_date = document.getElementById('last_date').value
  if(last_date == ""){
    alert('Please enter a valid date for the END of your desired travel range')
    event.preventDefault()
    return
  }
  const deviation_limit = document.getElementById('deviation_limit').value
  if(deviation_limit == ""){
    alert('Please enter a deviation limit between 0 minutes and 120 minutes')
    event.preventDefault()
    return
  }
  if(deviation_limit > 120){
    alert('Please choose a max deviation limit below 120 minutes')
    event.preventDefault()
    return
  }
  if(isNaN(deviation_limit)){
    alert('Please enter a valid deviation limit between 0 minutes and 120 minutes')
    event.preventDefault()
    return
  }
})