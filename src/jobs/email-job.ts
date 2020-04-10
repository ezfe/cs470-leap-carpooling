const nodemailer = require('nodemailer')
const transporter = nodemailer.createTransport({
  service: 'SendInBlue',
  auth: {
    user: 'leaplifts@gmail.com',
    pass: 'qW4NAZ6TKaSdBsMJ'
  }
});

export default async function job() {
  // Check if we need to email someone!
}