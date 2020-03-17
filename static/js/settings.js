var displayPhoto = function(event) {
  var image = document.getElementById('uploadedPhoto')
  image.src = URL.createObjectURL(event.target.files[0])
}

const formSync = registerAutocomplete('location_field', 'place_id_field')

document.getElementById('request_form').addEventListener('submit', (event) => {
  if (!formSync()) {
    alert("No Place ID!")
    event.preventDefault()
    return
  }
})
