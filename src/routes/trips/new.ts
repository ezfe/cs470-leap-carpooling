import { Response, Router } from 'express'
import db from '../../db'
import { TripRequest } from '../../models/trip_requests'
import { AuthedReq } from '../../utils/authed_req'
import moment from 'moment'

const routes = Router()

const nodemailer = require('nodemailer')
const transporter = nodemailer.createTransport({
  service: 'SendInBlue',
  auth: {
    user: 'leaplifts@gmail.com',
    pass: 'qW4NAZ6TKaSdBsMJ'
  }
});

// GET /trips/new
routes.get('/', (req: AuthedReq, res: Response) => {
  const googleMapsAPIKey = process.env.GOOGLE_MAPS_PLACES_KEY
  if (!googleMapsAPIKey) {
    res.send('GOOGLE_MAPS_PLACES_KEY is unset')
    return
  }

  const defaultDeviationLimit = req.user?.deviation_limit

  res.render('trips/new', {
    googleMapsAPIKey,
    defaultDeviationLimit
  })
})

// POST /trips/new
routes.post('/', async (req: AuthedReq, res: Response) => {
  try {
    const deviationLimitString = req.body.deviation_limit
    const deviationLimit = parseInt(deviationLimitString, 10)
    console.log(deviationLimit)

    await db<TripRequest>('trip_requests').insert({
        member_id: req.user?.id,
        role: req.body.user_role,
        location: req.body.place_id,
        location_description: req.body.location_description,
        deviation_limit: deviationLimit,
        direction: req.body.trip_direction,
        first_date: req.body.first_date,
        last_date: req.body.last_date,
        created_at: db.fn.now()
      })
    console.log(req.body.trip_direction)
    console.log(req.body.first_date)

    // Send trip processing email
    let message = `Hello ${req.user?.preferred_name}, <br> Thanks for submitting a trip request! We have you travelling `
    message += (req.body.trip_direction == 'to') ? 'to Lafayette College from ' : 'from Lafayette College to '
    message += `${req.body.location_description} sometime between ${req.body.first_date} and ${req.body.last_date}.
               We'll let you know once we've found you someone to ride with! <br> The LEAP Lifts Team`
    
    await transporter.sendMail({
      from: '"LEAP Lifts" <leaplifts@gmail.com>',
      to: req.user?.email,
      subject: "Trip Request Processing",
      html: message
    });

    res.redirect('/trips')
  } catch (err) {
    console.error(err)
    res.render('database-error')
  }
})

export default routes
