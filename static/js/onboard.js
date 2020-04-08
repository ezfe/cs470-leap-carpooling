function displayPhoto(event) {
  var image = document.getElementById('uploadedPhoto')
  image.src = URL.createObjectURL(event.target.files[0])
}

// document.getElementById('onboard-form').addEventListener('submit', (event) => {
// Can do JS client-side validation here in the
// future
// })

function ValidateEmail(mail) 
{
 if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail))
  {
    return true
  }
    return false
}

function ValidatePhone(phone)
{
  var phoneno = /^\d{10}$/;
  if(phoneno.test(phone))
  {
    return true
  }
  else
  {
    return false
  }
}
function ValidateName(name)
{
  var na = /^[A-Za-z]+$/
  if(na.test(name))
  {
    return true
  }
  else
  {
    return false
  }
}

document.getElementById('onboard_form').addEventListener('submit', (event) => {
  const email = document.getElementById("preferred_email").value

  if(ValidateEmail(email)===false)
  {
    event.preventDefault()
    alert("Please enter a valid email address")
    return
  }
  const phone = document.getElementById("phone_number").value
  if(ValidatePhone(phone)===false)
  {
    event.preventDefault()
    alert("Please enter a valid 10 digit phone number")
    return
  }
  const name = document.getElementById("preferred_name").value
  if(ValidateName(name)===false)
  {
    event.preventDefault()
    alert("Please enter a valid name")
    return
  }
})