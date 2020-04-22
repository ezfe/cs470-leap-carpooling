import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'SendInBlue',
  auth: {
    user: process.env.SENDINBLUE_EMAIL,
    pass: process.env.SENDINBLUE_PASSWORD
  }
})

/**
 * Allow users to send a message to LEAP.
 */
export async function sendMessage(email: string, subject: string, message: string) {
  await transporter.sendMail({
    from: email,
    to: 'leaplifts@gmail.com',
    subject: subject,
    text: message
  });
}

/**
 * Send a given user a welcome email.
 */
export async function sendWelcomeEmail(name : string, email : string) {
  await transporter.sendMail({
    from: '"LEAP Lifts" <leaplifts@gmail.com>',
    to: email,
    subject: "Welcome to LEAP Lifts",
    html: `Hello ${name}, <br><br>
          Thanks for signing up for LEAP Lifts! To get started, visit your dashboard and create a trip request.
          First, we'll match you with another student along your route, then we'll ask for confirmation from both
          of you before confirming your ride. <br><br> Hope to see you soon! <br><br> The LEAP Lifts Team`
  });
}

/**
 * Send a given user a trip processing email in response to making a trip request.
 */
export async function sendTripProcessingEmail(
  name : string, email : string, trip_direction : string, location : string, firstDate, lastDate) {
  firstDate = prettyDate(new Date(firstDate))
  lastDate = prettyDate(new Date(lastDate))
  let message = `Hello ${name}, <br><br> Thanks for submitting a trip request! We have you travelling`
      message += (trip_direction == 'to_lafayette') ? ` to Lafayette College from ${location}` : ` from Lafayette College to ${location}`
      message += (firstDate == lastDate) ? ` on ${firstDate}. ` : ` sometime between ${firstDate} and ${lastDate}. `
      message += `We'll let you know once we've found you someone to ride with! <br><br> The LEAP Lifts Team`

  await transporter.sendMail({
    from: '"LEAP Lifts" <leaplifts@gmail.com>',
    to: email,
    subject: "Trip Request Processing",
    html: message
  });
}

export async function sendTripMatchEmail(
  name : string, email : string, driver : boolean, passengerFirstName : string, passengerLastName : string, trip_direction : string,
  driverLocation : string, riderLocation : string, firstDate, lastDate) {
  firstDate = prettyDate(new Date(firstDate))
  lastDate = prettyDate(new Date(lastDate))
  let message = `Hello ${name}, <br><br> We found you a `
      message += (driver) ? `rider! You will be driving ${passengerFirstName} ${passengerLastName}` : 
      `driver! ${passengerFirstName} ${passengerLastName} will be driving you`
      message += (trip_direction == 'to_lafayette') ? 
      ` to Lafayette College from ${riderLocation} on the way from ${driverLocation}`  : 
      ` from Lafayette College to ${riderLocation} on the way to ${driverLocation}`
      message += (firstDate == lastDate) ? ` on ${firstDate}. ` : ` sometime between ${firstDate} and ${lastDate}. `
      message += 'Please login to LEAP Lifts to confirm or reject your trip. <br><br> The LEAP Lifts Team'

  await transporter.sendMail({
    from: '"LEAP Lifts" <leaplifts@gmail.com>',
    to: email,
    subject: "Trip Match Found",
    html: message
  });
}

/**
 * Send a given user an email once both members of a match have confirmed a trip.
 */
export async function sendTripConfirmationEmail(
  name : string, email : string, location : string, passengerName : string, passengerLocation : string, firstDate, lastDate) { 
  firstDate = prettyDate(new Date(firstDate)) 
  lastDate = prettyDate(new Date(lastDate))
  let message = `Hello ${name}, <br><br> Both you and ${passengerName} have confirmed your trip.
                Here are your trip details: <br>
                Your location: ${location} <br>
                ${passengerName}'s location: ${passengerLocation} <br>`
      message += (firstDate == lastDate) ? `Date: ${firstDate}` : `Date Range: ${firstDate} to ${lastDate}`
      message += '<br><br> The LEAP Lifts Team'
  
  await transporter.sendMail({
    from: '"LEAP Lifts" <leaplifts@gmail.com>',
    to: email,
    subject: "Trip Confirmation",
    html: message
  });
}

/**
 * Send a given user an email reminding them of an upcoming trip.
 */
export async function sendTripReminderEmail(
  name : string, email : string, firstDate, lastDate, driver: boolean, passengerName : string, trip_direction : string, 
  driverLocation : string, riderLocation : string) {
  firstDate = prettyDate(new Date(firstDate))
  lastDate = prettyDate(new Date(lastDate))
  let message = `Hello ${name}, <br><br> Your trip with ${passengerName} is coming up `
      message += (firstDate == lastDate) ? `on ${firstDate}! ` : `between ${firstDate} and ${lastDate}! `
      message += (driver) ? `You will be driving ${passengerName} ` : `${passengerName} will be driving you `
      message += (trip_direction == 'to_lafayette') ? 
      ` to Lafayette College from ${riderLocation} on the way from ${driverLocation}.`  : 
      ` from Lafayette College to ${riderLocation} on the way to ${driverLocation}.`
      message += `<br><br>Thanks for using LEAP Lifts! <br><br> The LEAP Lifts Team`

  await transporter.sendMail({
    from: '"LEAP Lifts" <leaplifts@gmail.com>',
    to: email,
    subject: "Trip Reminder",
    html: message
  });
}

function prettyDate(date : Date){
  var d = date.getDate();
  var monthNames = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
  var m = monthNames[date.getMonth()];
  var y = date.getFullYear();
  return `${m} ${d}, ${y}`;
}