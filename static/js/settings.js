var submitForm = function(event) {
  document.getElementById("photo_form").submit()
}

window.onload = function () {
  if (document.getElementById("uploadedPhoto").src.includes('/static/blank-profile.png')) {
    document.getElementById("exitButton").style.visibility = "hidden";
  }
}

const formSync = registerAutocomplete('location_field', 'place_id_field')

document.getElementById('request_form').addEventListener('submit', (event) => {
  if (!formSync()) {
    alert("No Place ID!")
    event.preventDefault()
    return
  }
})
