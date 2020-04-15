var submitForm = function(event) {
  document.getElementById("photo_form").submit()
}

if (!document.getElementById("uploadedPhoto").src.includes('/static/blank-profile.png')) {
  document.getElementById("exitButton").style.visibility = "visible";
}

document.getElementById('onboard_form').addEventListener('submit', (event) => {
  if (!event.target.checkValidity()) {
    event.preventDefault()
    event.stopPropagation()
    alert("Please correct the highlighted errors")
  }
  event.target.classList.add('was-validated')
})