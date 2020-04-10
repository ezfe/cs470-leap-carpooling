function displayPhoto(event) {
  var image = document.getElementById('uploadedPhoto')
  image.src = URL.createObjectURL(event.target.files[0])
}

document.getElementById('onboard_form').addEventListener('submit', (event) => {
  if (!event.target.checkValidity()) {
    event.preventDefault()
    event.stopPropagation()
    alert("Please correct the highlighted errors")
  }
  event.target.classList.add('was-validated')
})