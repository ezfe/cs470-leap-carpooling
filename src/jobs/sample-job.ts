import { distanceMatrix } from '../utils/distances'
import db from '../db'
import { TripMatch } from '../models/trip_matches'
import { TripRequest } from '../models/trip_requests'

export default async function job() {
  console.error("were in the job")
  const pairs = await processDirection('from_lafayette')
  pairs.sort((a, b) => { return a.cost - b.cost })
  findPairs(pairs)
}

async function findPairs(pairs: any[]) {
  if (pairs.length === 0){
    console.error("in the empty if")
    return
  }

  const dId = pairs[0].driverRecord.id
  const rId = pairs[0].riderRecord.id

  console.log("this is the dId")
  console.log(dId)
  console.log("this is the rId")
  console.log(rId)

  try {
    const match = await db('trip_matches')
      .insert({
        driver_request_id: dId,
        rider_request_id: rId,
        date: db.fn.now(),
        time: 'morning',
        rider_confirmed: false,
        driver_confirmed: false,
        created_at: db.fn.now()
      })
      .returning<TripMatch>('*')

    pairs.shift()

    for (let i = pairs.length - 1; i > 0; i--) {
      if (pairs[i].driverRecord.id === dId || pairs[i].riderRecord.id === rId) {
        pairs.splice(i, 1)
      }
    }
  } catch (err) {
    console.error('There was a database issue')
    console.error(err)
  }
  // add the match to the table
  // delete all records with rider and driver requests
}
async function checkForMatch(id: number, personType: 'driver' | 'rider'){
  if(personType === 'driver'){
    try {
      const matchingRecords = await db<TripMatch>('trip_matches')
        .where({driver_request_id:id})
        .select('*')

      if (matchingRecords.length > 0){
        console.log("found a match")
        return true
      }
    } catch (err) {
      console.error(err)
      console.error('in the catch')
    }
  } else {
    try{
      const matchingRecord = await db('trip_matches')
        .where({rider_request_id:id})
        .select<TripMatch>('*')

      if (matchingRecord){
        console.error("found a match")
        return true
      }
    } catch (err) {
      console.error(err)
      console.error('in the catch')
    }
  }
  return false
}
async function processDirection(direction) {
  try {
    const driverRecords = await db<TripRequest>('trip_requests')
      .where({ role: 'driver', direction })
      .select('*')
    console.log(driverRecords)

    const riderRecords = await db<TripRequest>('trip_requests')
      .where({ role: 'rider', direction })
      .select('*')
    console.log(riderRecords)

    const arr = []
    console.log("before loop")
    for (const driverRecord of driverRecords) {
      console.log("in the outer loop")

      const check = await checkForMatch(driverRecord.id,'driver')
      if( !check){
        for (const riderRecord of riderRecords) {
          const check1 = await(checkForMatch(riderRecord.id,'rider'))
          if( !check1){
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
            else{
              console.error("in the else where nothing happens");
            }
          }
        }
      }
    }
  } catch (err) {
    console.error('in the catch')
    return []
  }
}
