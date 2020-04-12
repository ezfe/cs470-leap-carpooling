var submitForm = function(event) {
  document.getElementById("photo_form").submit()
}

window.onload = function () {
  if (!document.getElementById("uploadedPhoto").src.includes('/static/blank-profile.png')) {
    document.getElementById("exitButton").style.visibility = "visible";
  }
}

var setCheckboxValue = function(event) {
  let checkbox = document.getElementById("notifications_checkbox")
  let notificationsField = document.getElementById("allow_notifications_field")
  if (checkbox.checked) {
    notificationsField.value=true
  } else {
    notificationsField.value=false
  }
}

document.getElementById('onboard_form').addEventListener('submit', (event) => {
  if (!event.target.checkValidity()) {
    event.preventDefault()
    event.stopPropagation()
    alert("Please correct the highlighted errors")
  }
  event.target.classList.add('was-validated')
})