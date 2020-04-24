import registerAutocomplete from './location_autocomplete.js'

const formSync = registerAutocomplete('location_field', 'place_id_field')

if (!document.getElementById("uploadedPhoto").src.includes('/static/blank-profile.png')) {
  document.getElementById("exitButton").style.display = null;
}

function updateDeviationExplanationValidation() {
  if (document.getElementById('request_form').classList.contains('was-validated')) {
    if (document.getElementById('deviation_limit').checkValidity()) {
      document.getElementById('deviation_exp').classList.remove('text-danger')
    } else {
      document.getElementById('deviation_exp').classList.add('text-danger')
    }
  }
}
document.getElementById('deviation_limit').addEventListener('keyup', updateDeviationExplanationValidation)

document.getElementById('request_form').addEventListener('submit', (event) => {
  if (!event.target.checkValidity() || !formSync()) {
    event.preventDefault()
    event.stopPropagation()
    alert("Please correct the highlighted errors")
  }

  event.target.classList.add('was-validated')
  updateDeviationExplanationValidation()
})

document.getElementById('imageInput').addEventListener('change', () => {
  document.getElementById('photo_form').submit()
})