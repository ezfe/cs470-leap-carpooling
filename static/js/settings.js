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
// document.getElementById('request_form').addEventListener('submit', (event) => {
//   if (!formSync()) {
//     alert("Please enter a valid location")
//     event.preventDefault()
//     return
//   }
//   const deviation_limit = document.getElementById('deviation_limit').value
//   if(deviation_limit == ""){
//     alert('Please enter a deviation limit between 0 minutes and 120 minutes')
//     event.preventDefault()
//     return
//   }
//   if(deviation_limit > 1440){
//     alert('Please choose a max deviation limit below 1440 minutes')
//     event.preventDefault()
//     return
//     }
//   if(isNaN(deviation_limit)){
//     alert('Please enter a valid deviation limit between 0 minutes and 120 minutes')
//     event.preventDefault()
//     return
//   }
//   const phone = document.getElementById("_phone").value
//   var na = /^\d{10}$/;
//   if(!na.test(phone))
//   {
//     event.preventDefault()
//     alert("Please enter a valid 10 digit phone number")
//     return
//   }
//   const name = document.getElementById("preferred_name").value
//   const n = /^[A-Za-z']+$/;
//   if(!n.test(name))
//   {
//     event.preventDefault()
//     alert("Please enter a valid name")
//     return
//   }
//   const notifications = document.getElementById("allow_notifications_field").value
//   if(!(notifications == 'true' || notifications == 'false' || notifications == '')) {
//     document.getElementById("allow_notifications_field").value=''
//   }
// })

