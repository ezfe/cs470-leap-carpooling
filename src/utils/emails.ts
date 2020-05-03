import nodemailer from 'nodemailer'
import { User, getPreferredFirstName, getEmail } from '../models/users';
import { TripRequest } from '../models/trip_requests';
import { TripMatch } from '../models/trip_matches';
import { formatLocation } from './location_formatter';

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
      message += '<br><br>Thanks for submitting a trip request! We have you travelling'
      if (tripRequest.direction == 'towards_lafayette') {
        message += ` to Lafayette College from ${formatLocation(tripRequest.location_description, 'full')}`
      } else {
        message += ` from Lafayette College to ${formatLocation(tripRequest.location_description, 'full')}`
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
 * Send an email confirming a trip match
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

  const isDriver = driverRequest.member_id == user.id

  let message = `Hello ${getPreferredFirstName(user)},`
      message += '<br><br>We found you a '
      message += (isDriver) ? `rider!` : `driver!`
      message += formatTripDetails(user, otherUser, tripMatch, riderRequest, driverRequest)
      message += ` Please login to ${process.env.SITE_NAME} to confirm or reject your trip. <br><br> The ${process.env.SITE_NAME} Team`

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
 * @param riderRequest The rider's request
 * @param driverRequest The driver's request
 */
export async function sendTripConfirmationEmail(
  user: User,
  otherUser: User,
  tripMatch: TripMatch,
  riderRequest: TripRequest,
  driverRequest: TripRequest) { 
  if (!process.env.SENDINBLUE_EMAIL || !process.env.SENDINBLUE_PASSWORD) return;

  let message = `Hello ${getPreferredFirstName(user)},
                <br><br> Both you and ${getPreferredFirstName(otherUser)} have confirmed your trip.`
      message += formatTripDetails(user, otherUser, tripMatch, riderRequest, driverRequest)
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
 * @param user The user to email
 * @param otherUser The other user in the match
 * @param tripMatch The match
 * @param riderRequest The rider's request
 * @param driverRequest The driver's request
 */
export async function sendTripReminderEmail(
  user: User,
  otherUser: User,
  tripMatch: TripMatch,
  riderRequest: TripRequest,
  driverRequest: TripRequest) {
  if (!process.env.SENDINBLUE_EMAIL || !process.env.SENDINBLUE_PASSWORD) return;
  
  let message = `Hello ${getPreferredFirstName(user)}, <br><br> Your trip with ${getPreferredFirstName(otherUser)} is coming up soon! `
      message += formatTripDetails(user, otherUser, tripMatch, riderRequest, driverRequest)
      message += `<br><br>Thanks for using ${process.env.SITE_NAME}! <br><br>The ${process.env.SITE_NAME} Team`

  await transporter.sendMail({
    from: `"${process.env.SITE_NAME}" <${process.env.CONTACT_EMAIL}>`,
    to: getEmail(user),
    subject: "Trip Reminder",
    html: message
  });
}

/**
 * Send a given user an email if they no longer have a match.
 * @param user The user to email
 * @param otherUser The other user in the match
 */
export async function sendTripReprocessingEmail(
  user: User,
  otherUser : User
) {
  let message = `Hello ${getPreferredFirstName(user)}, <br><br>`
      message += `We're emailing to let you know that your trip match, ${getPreferredFirstName(otherUser)}, 
                  has cancelled or otherwise changed their trip, so we're going to have to reprocess your trip request.  
                  Don't worry, we'll let you know when we find you a new match! 
                  <br><br>The ${process.env.SITE_NAME} Team`

  await transporter.sendMail({
    from: `"${process.env.SITE_NAME}" <${process.env.CONTACT_EMAIL}>`,
    to: getEmail(user),
    subject: "Reprocessing Trip Request",
    html: message
  })
}

/**
 * Take trip details and format for use in emails to matched users.
 * @param user The user to email
 * @param otherUser The other user in the match
 * @param tripMatch The match
 * @param riderRequest The rider's request
 * @param driverRequest The driver's request
 */
function formatTripDetails(
  user: User,
  otherUser: User,
  tripMatch: TripMatch,
  riderRequest: TripRequest,
  driverRequest: TripRequest) {

  // To assure the database actually gave us a date!
  if (!(tripMatch.first_date instanceof Date && tripMatch.last_date instanceof Date)) {
    console.error("Trip request dates weren't the right type")
    console.error(typeof tripMatch.first_date, typeof tripMatch.last_date)
    return
  }

  const firstDateString = prettyDate(tripMatch.first_date)
  const lastDateString = prettyDate(tripMatch.last_date)

  const riderLocation = formatLocation(riderRequest.location_description, 'full')
  const driverLocation = formatLocation(driverRequest.location_description, 'full')
  const isDriver = driverRequest.member_id == user.id
  const tripDirection = driverRequest.direction

  let message = (isDriver) ? ` You will be driving ${getPreferredFirstName(otherUser)}` : 
    ` ${getPreferredFirstName(otherUser)} will be driving you`
  if (tripDirection == 'towards_lafayette') {
    message += ` to Lafayette College from ${riderLocation}`
    message += (isDriver && riderLocation != driverLocation) ? ` on the way from ${driverLocation}` : ``
  } else {
    message += ` from Lafayette College to ${riderLocation}`
    message += (isDriver && riderLocation != driverLocation) ? ` on the way to ${driverLocation}` : ``
  }
  message += (firstDateString == lastDateString) ? ` on ${firstDateString}.` : ` sometime between ${firstDateString} and ${lastDateString}.`

  return message
}

function prettyDate(date: Date){
  const day = date.getDate();
  const monthNames = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
}