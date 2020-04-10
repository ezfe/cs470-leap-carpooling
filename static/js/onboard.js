function displayPhoto(event) {
  var image = document.getElementById('uploadedPhoto')
  image.src = URL.createObjectURL(event.target.files[0])
}

function validatePhone(phone) {
  const phoneno = /^\d{10}$/;
  return phoneno.test(phone)
}

function validateName(name) {
  const na = /^[A-Za-z]+$/
  return na.test(name)
}

document.getElementById('onboard_form').addEventListener('submit', (event) => {
  const phone = document.getElementById("phone_number").value
  if(validatePhone(phone) === false) {
    event.preventDefault()
    alert("Please enter a valid 10 digit phone number")
    return
  }

  const name = document.getElementById("preferred_name").value
  if(validateName(name) === false) {
    event.preventDefault()
    alert("Please enter a valid name")
    return
  }
})