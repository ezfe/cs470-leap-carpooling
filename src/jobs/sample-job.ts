import { distanceMatrix } from '../utils/distances'
import db from '../db'
import { TripMatch } from '../models/trip_matches'

export default async function job() {
  const pairs = await processDirection('towards_lafayette')
  pairs.sort((a, b) => { return a.cost - b.cost })
  findPairs(pairs)
}

async function findPairs(pairs) {
  try {
    const matches = await db<TripMatch>('trip_matches')
      .returning('*')
      .insert({
        driver_request_id: pairs[0].driverRec.id,
        rider_request_id: pairs[0].riderRec.id,
        date: db.fn.now(),
        time: 'morning',
        rider_confirmed: false,
        driver_confirmed: true,
        created_at: db.fn.now()
      })
    const driverId = pairs[0].driverRec.id
    const riderId = pairs[0].riderRec.id
    pairs.shift()
    for (let i = pairs.length - 1; i > 0; i--) {
      if (pairs[i].driverRec.id === driverId || pairs[i].riderRec.id === riderId) {
        pairs.splice(i, 1)
      }
    }
  } catch (err) {
    console.error('There was a database issue')
  }
  // add the match to the table
  // delete all records with rider and driver requests 
}

async function processDirection(direction) {
  try {
    const driverRecords = await db('trip_requests')
      .where({ role: 'driver', direction })
      .select('*')
    console.log(driverRecords)

    const riderRecords = await db('trip_requests')
      .where({ role: 'rider', direction })
      .select('*')
    console.log(riderRecords)

    const arr = []
    for (const driverRecord of driverRecords) {
      for (const riderRecord of driverRecords) {
        const { driverCost, riderCost } = await distanceMatrix(driverRecord.location, riderRecord.location, direction)
        const pair = { driverRecord, riderRecord }
        if (driverCost < driverRecord.deviation_limit) {
          if (riderCost < riderRecord.deviation_limit) {
            arr.push({
              ...pair,
              cost: Math.min(riderCost, driverCost)
            })
          } else {
            arr.push({
              ...pair,
              cost: driverCost
            })
          }
        } else if (riderCost < riderRecord.deviation_limit) {
          arr.push({
            ...pair,
            cost: riderCost
          })
        }
      }
    }
    return arr

  } catch (err) {
    console.error('in the catch')
    return []
  }
}

module.exports = job
