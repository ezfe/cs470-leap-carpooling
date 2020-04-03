import { Router, Response } from 'express'
import { AuthedReq } from '../utils/authed_req'
import db from '../db'
import { requireAuthenticated } from '../middleware/auth'
import { TripRequest } from '../models/trip_requests'

//import $ from 'jquery'
/* var jsdom = require('jsdom');
var $ = require('jquery')(new jsdom.JSDOM().window); */

const routes = Router()

// GET /trips/new
routes.get('/', requireAuthenticated, (req: AuthedReq, res: Response) => {
  const googleMapsAPIKey = process.env.GOOGLE_MAPS_PLACES_KEY
  if (!googleMapsAPIKey) {
    res.send('GOOGLE_MAPS_PLACES_KEY is unset')
    return
  }

  const defaultDeviationLimit = req.user.deviation_limit

  //bootstrap date selector I couldnt get working
  /* var date_input=$('input[name="date_beginning"]'); //our date input has the name "date"
  var container=$('.bootstrap-iso form').length>0 ? $('.bootstrap-iso form').parent() : "body";
  var options={
    format: 'mm/dd/yyyy',
    container: container,
    todayHighlight: true,
    autoclose: true,
  };
  date_input.datepicker(options); */

  res.render('new_trip', {
    googleMapsAPIKey,
    defaultDeviationLimit
  })
})

// POST /trips/new
routes.post('/', requireAuthenticated, async (req: AuthedReq, res: Response) => {
  try {
    const deviationLimitString = req.body.deviation_limit
    const deviationLimit = parseInt(deviationLimitString, 10)
    console.log(deviationLimit)

    //do input validation on the dates, check that its a valid date, check that the date has not happened yet

    await db<TripRequest>('trip_requests').insert({
      member_id: req.user.id,
      role: req.body.user_role,
      location: req.body.place_id,
      location_description: req.body.location_description,
      deviation_limit: deviationLimit,
      direction: 'from_lafayette', // req.body.direction,
      created_at: db.fn.now(),
      end_date: req.body.end_date,
      start_date: req.body.start_date
    })

    res.redirect('/trips')
  } catch (err) {
    console.error(err)
    res.render('database-error')
  }
})

function reverseLocations(){
  
}


/* $(document).ready(function(){
  var date_input=$('input[name="date_beginning"]'); //our date input has the name "date"
  var container=$('.bootstrap-iso form').length>0 ? $('.bootstrap-iso form').parent() : "body";
  var options={
    format: 'mm/dd/yyyy',
    container: container,
    todayHighlight: true,
    autoclose: true,
  };
  date_input.datepicker(options);
}) */

export default routes
