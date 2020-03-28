import { distanceMatrix } from '../utils/distances'
import db from '../db'
import { TripMatch } from '../models/trip_matches'
import { TripRequest } from '../models/trip_requests'

export default async function job() {
  console.log("Starting Pairing Process")

  console.log('Generating Pairs From Lafayette')
  const pairsFromLafayette = await calculatePairsWithCost('from_lafayette')
  console.log('Found pairs', pairsFromLafayette)

  console.log('Generating Pairs Towards Lafayette')
  const pairsTowardsLafayette = await calculatePairsWithCost('towards_lafayette')
  console.log('Found pairs', pairsTowardsLafayette)

  const pairs = [...pairsFromLafayette, ...pairsTowardsLafayette]
  pairs.sort((a, b) => { return a.cost - b.cost })

  console.log('Matching Pairs')
  matchFirstPair(pairs)
}

interface PotentialPair {
  driver_request_id: number
  driver_id: number
  driver_location: string
  driver_deviation_limit: number
  rider_request_id: number
  rider_id: number
  rider_location: string
  rider_deviation_limit: number
}

async function generatePotentialPairs(direction: 'from_lafayette' | 'towards_lafayette'): Promise<PotentialPair[]> {
  try {
    const res = await db.transaction(async (trx) => {
      // Create View
      const rawViewQuery = trx.raw(`
        SELECT
          trip_requests_t.id AS trip_request_id,
          trip_requests_t.member_id AS member_id,
          trip_requests_t.role AS role,
          trip_requests_t.location AS location,
          trip_requests_t.deviation_limit AS deviation_limit,
          trip_times.id as trip_time_id,
          trip_times.date as trip_date,
          trip_times.time as trip_time
        FROM (
          SELECT trip_requests.*
          FROM trip_requests
          LEFT JOIN trip_matches
          ON
            trip_requests.id=trip_matches.driver_request_id
            OR trip_requests.id=trip_matches.RIDER_request_id
          WHERE
            trip_matches.id IS NULL
        ) as trip_requests_t
        RIGHT JOIN trip_times
        ON trip_requests_t.id=trip_times.request_id
        WHERE trip_requests_t.direction = ?`, direction)

      await trx.raw(`CREATE OR REPLACE TEMPORARY VIEW trip_requests_times AS (${rawViewQuery})`)

      // Query Pairs
      return await trx.raw(`
        SELECT
          left_t.trip_request_id AS driver_request_id,
          left_t.member_id AS driver_id,
          left_t.location AS driver_location,
          left_t.deviation_limit AS driver_deviation_limit,
          right_t.trip_request_id AS rider_request_id,
          right_t.member_id AS rider_id,
          right_t.location AS rider_location,
          right_t.deviation_limit AS rider_deviation_limit
        FROM (
          SELECT * FROM trip_requests_times WHERE role='driver'
        ) as left_t
        INNER JOIN (
          SELECT * FROM trip_requests_times WHERE role='rider'
        ) as right_t
        ON
          left_t.trip_request_id < right_t.trip_request_id
          AND left_t.trip_date = right_t.trip_date
          AND left_t.trip_time = right_t.trip_time
        `)
    })

    return res.rows
  } catch (err) {
    console.error('An error occurred generating potential pairs')
    console.error(err)
    return []
  }
}

interface PricedPair {
  driver_request_id: number
  rider_request_id: number
  cost: number
  firstPortion: 'driver' | 'rider'
}

async function calculatePairsWithCost(direction: 'from_lafayette' | 'towards_lafayette'): Promise<PricedPair[]> {
  const potentialPairs = await generatePotentialPairs(direction)
  const pricedPairs = Array<PricedPair>()

  for (const potential of potentialPairs) {
    console.log('Pricing potential pair', potential)

    const mtrx = await distanceMatrix(potential.driver_location, potential.rider_location, direction)
    console.log('Found cost information', mtrx)

    const res = {
      driver_request_id: potential.driver_request_id,
      rider_request_id: potential.rider_request_id,
    }

    if (mtrx.driverCost <= potential.driver_deviation_limit) {
      // driver could pay
      // rider unknown
      if (mtrx.riderCost <= potential.rider_deviation_limit) {
        // either could pay
        pricedPairs.push({
          ...res,
          cost: Math.min(mtrx.driverCost, mtrx.riderCost),
          firstPortion: (mtrx.driverCost <= mtrx.riderCost) ? 'driver' : 'rider'
        })
      } else {
        // only driver could pay
        pricedPairs.push({
          ...res,
          cost: mtrx.driverCost,
          firstPortion: 'driver'
        })
      }
    } else if (mtrx.riderCost <= potential.rider_deviation_limit) {
      // only rider could pay
      pricedPairs.push({
        ...res,
        cost: mtrx.riderCost,
        firstPortion: 'rider'
      })
    }
  }

  return pricedPairs
}

async function matchFirstPair(pairs: PricedPair[]) {
  if (pairs.length === 0){
    return
  }

  const { driver_request_id, rider_request_id, firstPortion } = pairs[0]

  try {
    await db<TripMatch>('trip_matches')
      .insert({
        driver_request_id,
        rider_request_id,
        date: db.fn.now(), // timeDate[0].date,
        time: 'morning',   // time: timeDate[0].time,
        rider_confirmed: false,
        driver_confirmed: false,
        first_portion: firstPortion,
        created_at: db.fn.now()
      })

    return
  } catch (err) {
    console.error('There was a database issue')
    console.error(err)
  }
}
