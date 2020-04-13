import registerAutocomplete from './location_autocomplete.js'

const formSync = registerAutocomplete('location_field', 'place_id_field')


if (document.getElementById("uploadedPhoto").src.includes('/static/blank-profile.png')) {
  document.getElementById("exitButton").style.visibility = "hidden";
}




document.getElementById('request_form').addEventListener('submit', (event) => {
  // Check Location Field
if (!formSync()) {
  // This regex always fails
  document.getElementById('location_field').setAttribute('pattern', '\\b')
} else {
  document.getElementById('location_field').removeAttribute('pattern')
}
  if (!event.target.checkValidity()) {
    event.preventDefault()
    event.stopPropagation()
    alert("Please correct the highlighted errors")
  }
  event.target.classList.add('was-validated')


})
