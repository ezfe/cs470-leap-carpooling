import nodemailer from 'nodemailer'
import { User, getPreferredFirstName, getEmail } from '../models/users';
import { TripRequest } from '../models/trip_requests';
import { TripMatch } from '../models/trip_matches';

const transporter = nodemailer.createTransport({
  service: 'SendInBlue',
  auth: {
    user: process.env.SENDINBLUE_EMAIL,
    pass: process.env.SENDINBLUE_PASSWORD
  }
})

/**
 * Allow users to send a message to site contact.
 * @param userEmail The email address of the user
 * @param subject The message subject
 * @param message The message
 */
export async function sendMessage(userEmail: string, subject: string, message: string) {
  if (!process.env.SENDINBLUE_EMAIL || !process.env.SENDINBLUE_PASSWORD) return;

  await transporter.sendMail({
    from: userEmail,
    to: process.env.CONTACT_EMAIL,
    replyTo: userEmail,
    subject: subject,
    text: message
  });
}

/**
 * Send a user a welcome email
 * @param user The user to send the email to
 */
export async function sendWelcomeEmail(user: User) {
  if (!process.env.SENDINBLUE_EMAIL || !process.env.SENDINBLUE_PASSWORD) return;

  await transporter.sendMail({
    from: `"${process.env.SITE_NAME}" <${process.env.CONTACT_EMAIL}>`,
    to: getEmail(user),
    subject: `Welcome to ${process.env.SITE_NAME}`,
    html: `Hello ${getPreferredFirstName(user)}, <br><br>
          Thanks for signing up for ${process.env.SITE_NAME}! To get started, visit your dashboard and create a trip request.
          First, we'll match you with another student along your route, then we'll ask for confirmation from both
          of you before confirming your ride. <br><br> Hope to see you soon! <br><br> The ${process.env.SITE_NAME} Team`
  });
}

/**
 * Send a user a trip processing email after they make a request
 * @param user The user to email
 * @param tripRequest The request information
 */
export async function sendTripProcessingEmail(user: User, tripRequest: TripRequest) {
  if (!process.env.SENDINBLUE_EMAIL || !process.env.SENDINBLUE_PASSWORD) return;

  // To assure the database actually gave us a date!
  if (!(tripRequest.first_date instanceof Date && tripRequest.last_date instanceof Date)) {
    console.error("Trip request dates weren't the right type")
    console.error(typeof tripRequest.first_date, typeof tripRequest.last_date)
    return
  }
  
  const firstDateString = prettyDate(tripRequest.first_date)
  const lastDateString = prettyDate(tripRequest.last_date)

  let message = `Hello ${getPreferredFirstName(user)},`
      message += '<br><br>'
      message += 'Thanks for submitting a trip request! We have you travelling'
      if (tripRequest.direction == 'towards_lafayette') {
        message += ` to Lafayette College from ${tripRequest.location_description}`
      } else {
        message += ` from Lafayette College to ${tripRequest.location_description}`
      }
      if (firstDateString == lastDateString) {
        message += ` on ${firstDateString}. `
      } else {
        message += ` sometime between ${firstDateString} and ${lastDateString}. `
      }
      message += `We'll let you know once we've found you someone to ride with! <br><br> The ${process.env.SITE_NAME} Team`

  await transporter.sendMail({
    from: `"${process.env.SITE_NAME}" <${process.env.CONTACT_EMAIL}>`,
    to: getEmail(user),
    subject: "Trip Request Processing",
    html: message
  });
}

/**
 * Send a email confirming a trip match
 * @param user The user to email
 * @param tripMatch The match that was found
 * @param driverRequest The driver's request
 * @param riderRequest The rider's request
 * @param otherUser The other user in the match
 */
export async function sendTripMatchEmail(
  user: User,
  tripMatch: TripMatch,
  driverRequest: TripRequest,
  riderRequest: TripRequest,
  otherUser: User) {
  if (!process.env.SENDINBLUE_EMAIL || !process.env.SENDINBLUE_PASSWORD) return;

  // To assure the database actually gave us a date!
  if (!(tripMatch.first_date instanceof Date && tripMatch.last_date instanceof Date)) {
    console.error("Trip request dates weren't the right type")
    console.error(typeof tripMatch.first_date, typeof tripMatch.last_date)
    return
  }
  const firstDateString = prettyDate(tripMatch.first_date)
  const lastDateString = prettyDate(tripMatch.last_date)

  const isDriver = driverRequest.member_id == user.id
  const tripDirection = driverRequest.direction

  let message = `Hello ${getPreferredFirstName(user)},`
      message += '<br><br>'
      message += 'We found you a '
      if (isDriver) {
        message += `rider! You will be driving ${getPreferredFirstName(otherUser)} ${otherUser.last_name}`
      } else {
        message += `driver! ${getPreferredFirstName(otherUser)} ${otherUser.last_name} will be driving you`
      }
      if (tripDirection == 'towards_lafayette') {
        if (riderRequest.location_description == driverRequest.location_description) {
          message += ` to Lafayette College from ${riderRequest.location_description}`
        } else {
          message += ` to Lafayette College from ${riderRequest.location_description} on the way from ${driverRequest.location_description}`
        }
      } else {
        if (riderRequest.location_description == driverRequest.location_description) {
          message += ` from Lafayette College to ${riderRequest.location_description}`
        } else {
          message += ` from Lafayette College to ${riderRequest.location_description} on the way to ${driverRequest.location_description}`
        }
      }
      message += (firstDateString == lastDateString) ? ` on ${firstDateString}. ` : ` sometime between ${firstDateString} and ${lastDateString}. `
      message += `Please login to ${process.env.SITE_NAME} to confirm or reject your trip. <br><br> The ${process.env.SITE_NAME} Team`

  await transporter.sendMail({
    from: `"${process.env.SITE_NAME}" <${process.env.CONTACT_EMAIL}>`,
    to: getEmail(user),
    subject: "Trip Match Found",
    html: message
  });
}

/**
 * Send a given user an email once both members of a match have confirmed a trip.
 * @param user The user to email
 * @param otherUser The other user in the match
 * @param tripMatch The match
 * @param userRequest The user's request
 * @param otherUserRequest The other user's request
 */
export async function sendTripConfirmationEmail(
  user: User,
  otherUser: User,
  tripMatch: TripMatch,
  userRequest: TripRequest,
  otherUserRequest: TripRequest) { 
  if (!process.env.SENDINBLUE_EMAIL || !process.env.SENDINBLUE_PASSWORD) return;

  // To assure the database actually gave us a date!
  if (!(tripMatch.first_date instanceof Date && tripMatch.last_date instanceof Date)) {
    console.error("Trip request dates weren't the right type")
    console.error(typeof tripMatch.first_date, typeof tripMatch.last_date)
    return
  }
  const firstDateString = prettyDate(tripMatch.first_date)
  const lastDateString = prettyDate(tripMatch.last_date)

  let message = `Hello ${getPreferredFirstName(user)},
                <br><br> Both you and ${getPreferredFirstName(otherUser)} have confirmed your trip.
                Here are your trip details: <br>
                Your location: ${userRequest.location_description} <br>
                ${getPreferredFirstName(otherUser)}'s location: ${otherUserRequest.location_description} <br>`
      message += (firstDateString == lastDateString) ? `Date: ${firstDateString}` : `Date Range: ${firstDateString} to ${lastDateString}`
      message += `<br><br> The ${process.env.SITE_NAME} Team`
  
  await transporter.sendMail({
    from: `"${process.env.SITE_NAME}" <${process.env.CONTACT_EMAIL}>`,
    to: getEmail(user),
    subject: "Trip Confirmation",
    html: message
  });
}

/**
 * Send a given user an email reminding them of an upcoming trip.
 */
export async function sendTripReminderEmail(
  name: string, email: string, firstDate, lastDate, driver: boolean, passengerName: string, trip_direction: string, 
  driverLocation: string, riderLocation: string) {
  if (!process.env.SENDINBLUE_EMAIL || !process.env.SENDINBLUE_PASSWORD) return;
  
  firstDate = prettyDate(new Date(firstDate))
  lastDate = prettyDate(new Date(lastDate))
  let message = `Hello ${name}, <br><br> Your trip with ${passengerName} is coming up `
      message += (firstDate == lastDate) ? `on ${firstDate}! ` : `between ${firstDate} and ${lastDate}! `
      message += (driver) ? `You will be driving ${passengerName} ` : `${passengerName} will be driving you `
      if (trip_direction == 'to_lafayette') {
        if (riderLocation == driverLocation) {
          message += ` to Lafayette College from ${riderLocation}.`  
        } else {
          message += ` to Lafayette College from ${riderLocation} on the way from ${driverLocation}.`  
        }
      } else { 
        if (riderLocation == driverLocation) {
          message += ` from Lafayette College to ${riderLocation}.`
        } else {
          message += ` from Lafayette College to ${riderLocation} on the way to ${driverLocation}.`
        }
      }
      message += `<br><br>Thanks for using ${process.env.SITE_NAME}! <br><br> The ${process.env.SITE_NAME} Team`

  await transporter.sendMail({
    from: `"${process.env.SITE_NAME}" <${process.env.CONTACT_EMAIL}>`,
    to: email,
    subject: "Trip Reminder",
    html: message
  });
}

function prettyDate(date: Date){
  const day = date.getDate();
  const monthNames = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
}