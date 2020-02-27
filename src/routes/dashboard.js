const routes = require('express').Router()

routes.get('/', (req, res) => {
  const trips = [
    {
      trip_id: 1,
      status: 'confirmed',
      other_member: {
        id: 2,
        name: 'Nicole Kaplan',
        location: 'Somewhere, New Jersey'
      },
      trip: ['Lafayette College', 'Somewhere, New Jersey', 'Hanover, New Hampshire']
    },
    {
      trip_id: 2,
      status: 'pending',
      other_member: {
        id: 2,
        name: 'Nicole Kaplan',
        location: 'Somewhere, New Jersey'
      },
      trip: ['Hanover, New Hampshire', 'Somewhere, New Jersey', 'Lafayette College']
    },
    {
      trip_id: 3,
      status: 'processing',
      trip: ['Lafayette College', 'Hanover, New Hampshire']
    }
  ]
  res.render('dashboard', { trips })
})

module.exports = routes
