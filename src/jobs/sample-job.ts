import { distanceMatrix } from '../utils/distances'
import db from '../db'
import { TripMatch } from '../models/trip_matches'
import { TripRequest } from '../models/trip_requests'

export default async function job() {
  console.log("Starting Pairing Process")

  console.log('Generating Pairs From Lafayette')
  const pairsFromLafayette = await generatePairs('from_lafayette')

  console.log('Generating Pairs Towards Lafayette')
  const pairsTowardsLafayette = await generatePairs('towards_lafayette')

  const pairs = [...pairsFromLafayette, ...pairsTowardsLafayette]
  pairs.sort((a, b) => { return a.cost - b.cost })

  console.log('Matching Pairs')
  matchPairs(pairs)
}

interface GeneratedPair {
  driverRecord: TripRequest
  riderRecord: TripRequest
  firstPortion: 'rider' | 'driver'
  cost: number
}

async function generatePairs(direction: 'from_lafayette' | 'towards_lafayette'): Promise<GeneratedPair[]> {
  try {
    const driverRecords = await db<TripRequest>('trip_requests')
      .where({ role: 'driver', direction })
      .select('*')
    console.log('Driver Records', driverRecords)

    const riderRecords = await db<TripRequest>('trip_requests')
      .where({ role: 'rider', direction })
      .select('*')
    console.log('Rider Records', riderRecords)

    const results = new Array<GeneratedPair>()

    for (const driverRecord of driverRecords) {

      const check = await checkForMatch(driverRecord.id,'driver')
      if( !check){
        for (const riderRecord of riderRecords) {
          const check1 = await(checkForMatch(riderRecord.id,'rider'))
          if( !check1){
            const { driverCost, riderCost } = await distanceMatrix(driverRecord.location, riderRecord.location, direction)
            const pair = { driverRecord, riderRecord }
            const timeDate =await checkMatchingTimes(riderRecord.id,driverRecord.id)
            if(timeDate.length != 0)
            {
            if (driverCost < driverRecord.deviation_limit) {
              if (riderCost < riderRecord.deviation_limit) {
                results.push({
                  ...pair,
                  cost: Math.min(riderCost, driverCost),
                  firstPortion: riderCost < driverCost ? 'rider' : 'driver'
                })
              } else {
                results.push({
                  ...pair,
                  cost: driverCost,
                  firstPortion: 'driver'
                })
              }
            } else if (riderCost < riderRecord.deviation_limit) {
              results.push({
                ...pair,
                cost: riderCost,
                firstPortion: 'rider'
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

async function matchPairs(pairs: GeneratedPair[]) {
  if (pairs.length === 0){
    return
  }

  const { driverRecord, riderRecord, firstPortion } = pairs[0]

  try {
    const timeDate = await checkMatchingTimes(riderRecord.id, driverRecord.id)
    await db<TripMatch>('trip_matches')
      .insert({
        driver_request_id: driverRecord.id,
        rider_request_id: riderRecord.id,
        date: timeDate[0].date,
        time: timeDate[0].time,
        rider_confirmed: false,
        driver_confirmed: false,
        first_portion: firstPortion,
        created_at: db.fn.now()
      })

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

async function checkMatchingTimes(riderId: number, driverId: number) {
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

        if ((""+driverTime.date ) === (""+riderTime.date))
        {
          if (driverTime.time === riderTime.time) {
            arr.push({
             time:driverTime.time, date : driverTime.date
            })

            return arr;
          }
        }
      }
    }
    console.log("returning nothing")
    return arr
  }catch (err) {
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
