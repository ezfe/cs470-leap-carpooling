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
async function checkMatchingTimes(riderId, driverId){

  try {
    const driverTimes= await db('trip_times')
      .where({ request_id: driverId })
      .select('*')
    console.log(driverTimes)
    const riderTimes= await db('trip_times')
      .where({ request_id: riderId })
      .select('*')
    console.log(riderTimes)
    let arr =[]
    for (const driverTime of driverTimes)
    {
      for(const riderTime of riderTimes){

        if ((""+driverTime.date )=== (""+riderTime.date))
        {
          if(driverTime.time === riderTime.time)
          {
            arr.push({
             time:driverTime.time, date : driverTime.date
            })

            return arr;
          }
        }
      }
    }
    console.log("returning nothing")
    return arr;
  }catch (err) {
    console.error('There was a database issue')
    console.error(err)
  }

}
async function findPairs(pairs: DirectionResult[]) {
  if (pairs.length === 0){
    return
  }

  const { driverRecord, riderRecord } = pairs[0]

  try {
    const timeDate =await checkMatchingTimes(riderRecord.id, driverRecord.id)
    await db<TripMatch>('trip_matches')
      .insert({
        driver_request_id: driverRecord.id,
        rider_request_id: riderRecord.id,
        date: timeDate[0].date,
        time: timeDate[0].time,
        rider_confirmed: false,
        driver_confirmed: false,
        // first_portion: ,
        created_at: db.fn.now()
      })
      .returning<TripMatch>('*')

    return
    // pairs.shift()

    // pairs = pairs.filter((pair) => {
    //   return pair.driverRecord.id == driverRecord.id || pair.riderRecord.id == riderRecord.id
    // })
  } catch (err) {
    console.error('There was a database issue')
    console.error(err)
  }
}

async function checkForMatch(id: number, personType: 'driver' | 'rider'): Promise<boolean> {
  const idParameter = personType === 'driver' ? 'driver_request_id' : 'rider_request_id'

  try {
    const matchingRecords = await db<TripMatch>('trip_matches')
      .where(idParameter, id)
      .select('*')

    if (matchingRecords.length > 0) {
      return true
    }
  } catch (err) {
    console.error(err)
    console.error('in the catch')
  }

  return false
}

interface DirectionResult {
  driverRecord: TripRequest
  riderRecord: TripRequest
  cost: number
}

async function processDirection(direction): Promise<DirectionResult[]> {
  try {
    const driverRecords = await db<TripRequest>('trip_requests')
      .where({ role: 'driver', direction })
      .select('*')
    console.log(driverRecords)

    const riderRecords = await db<TripRequest>('trip_requests')
      .where({ role: 'rider', direction })
      .select('*')

    const results = new Array<DirectionResult>()

    for (const driverRecord of driverRecords) {

      const check = await checkForMatch(driverRecord.id,'driver')
      if( !check){
        for (const riderRecord of riderRecords) {
          const check1 = await(checkForMatch(riderRecord.id,'rider'))
          if( !check1){
            const { driverCost, riderCost } = await distanceMatrix(driverRecord.location, riderRecord.location, direction)
            const pair = { driverRecord, riderRecord }
            const timeDate =await checkMatchingTimes(riderRecord.id,driverRecord.id)
            if(timeDate.length!=0)
            {
            if (driverCost < driverRecord.deviation_limit) {
              if (riderCost < riderRecord.deviation_limit) {
                results.push({
                  ...pair,
                  cost: Math.min(riderCost, driverCost)
                })
              } else {
                results.push({
                  ...pair,
                  cost: driverCost
                })
              }
            } else if (riderCost < riderRecord.deviation_limit) {
              results.push({
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
    }

    return results
  } catch (err) {
    console.error('in the catch')
    return []
  }
}
