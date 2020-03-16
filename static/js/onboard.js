function displayPhoto(event) {
  var image = document.getElementById('uploadedPhoto')
  image.src = URL.createObjectURL(event.target.files[0])
}

// document.getElementById('onboard-form').addEventListener('submit', (event) => {
// Can do JS client-side validation here in the
// future
// })