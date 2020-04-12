var submitForm = function(event) {
  document.getElementById("photo_form").submit()
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

window.onload = function () {
  if (document.getElementById("uploadedPhoto").src.includes('/static/blank-profile.png')) {
    document.getElementById("exitButton").style.visibility = "hidden";
  }
}

const formSync = registerAutocomplete('location_field', 'place_id_field')

document.getElementById('request_form').addEventListener('submit', (event) => {
  if (!event.target.checkValidity()) {
    event.preventDefault()
    event.stopPropagation()
    alert("Please correct the highlighted errors")
  }
    if (!formSync()) {
    alert("Please enter a valid location")
    event.preventDefault()
    return
  }
  event.target.classList.add('was-validated')
  const notifications = document.getElementById("allow_notifications_field").value
  if(!(notifications == 'true' || notifications == 'false' || notifications == '')) {
    document.getElementById("allow_notifications_field").value=''
  }
})
