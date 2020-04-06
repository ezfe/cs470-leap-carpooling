import db from '../db'
import { TripDirection, UserRole } from '../models/misc_types'
import { TripMatch } from '../models/trip_matches'
import { distanceMatrix } from '../utils/distances'
import { Raw } from 'knex'

export default async function job() {
  // console.log("Starting Pairing Process")

  // console.log('Generating Pairs From Lafayette')
  const pairsFromLafayette = await calculatePairsWithCost('from_lafayette')
  // console.log('Found pairs', pairsFromLafayette)

  // console.log('Generating Pairs Towards Lafayette')
  const pairsTowardsLafayette = await calculatePairsWithCost('towards_lafayette')
  // console.log('Found pairs', pairsTowardsLafayette)

  const pairs = [...pairsFromLafayette, ...pairsTowardsLafayette]
  pairs.sort((a, b) => { return a.cost - b.cost })

  // console.log('Matching Pairs')
  matchFirstPair(pairs)
}

interface PotentialPair {
  driver_request_id: number
  driver_id: number
  driver_location: string
  driver_deviation_limit: number
  driver_first_date: Date | Raw<any>
  driver_last_date: Date | Raw<any>
  rider_request_id: number
  rider_id: number
  rider_location: string
  rider_deviation_limit: number
  rider_first_date: Date | Raw<any>
  rider_last_date: Date | Raw<any>
}

async function generatePotentialPairs(direction: TripDirection): Promise<PotentialPair[]> {
  try {
    return await db.transaction(async (trx) => {
      function createSubquery(builder, role: UserRole) {
        builder.select('trip_requests.*')
          .from('trip_requests')
          .leftJoin('trip_matches', function() {
            this.on('trip_requests.id', '=', 'trip_matches.driver_request_id')
            .orOn('trip_requests.id', '=', 'trip_matches.rider_request_id')
          })
          .whereNull('trip_matches.id')
          .andWhere('trip_requests.direction', '=', direction)
          .andWhere('role', '=', role)
          .as(`${role}_t`)
      }

      // Query Pairs
      const potentialPairs = await trx.select([
          db.ref('driver_t.id').as('driver_request_id'),
          db.ref('driver_t.member_id').as('driver_id'),
          db.ref('driver_t.location').as('driver_location'),
          db.ref('driver_t.deviation_limit').as('driver_deviation_limit'),
          db.ref('driver_t.first_date').as('driver_first_date'),
          db.ref('driver_t.last_date').as('driver_last_date'),
          db.ref('rider_t.id').as('rider_request_id'),
          db.ref('rider_t.member_id').as('rider_id'),
          db.ref('rider_t.location').as('rider_location'),
          db.ref('rider_t.deviation_limit').as('rider_deviation_limit'),
          db.ref('rider_t.first_date').as('rider_first_date'),
          db.ref('rider_t.last_date').as('rider_last_date'),
        ])
        .from(function() {
          createSubquery(this, 'driver')
        })
        .innerJoin(
          function() { createSubquery(this, 'rider') },
          db.raw('GREATEST(driver_t.first_date, rider_t.first_date) <= LEAST(driver_t.last_date, rider_t.last_date)')
        )
        .leftJoin(
          'pair_rejections',
          function() {
            this.on(function() {
              this.on('pair_rejections.blocker_id', 'rider_t.member_id')
                .andOn('pair_rejections.blockee_id', 'driver_t.member_id')
            }).orOn(function() {
              this.on('pair_rejections.blocker_id', 'driver_t.member_id')
                .andOn('pair_rejections.blockee_id', 'rider_t.member_id')
            })
        })
        .whereNull('pair_rejections.id')

      // console.log(`Identified potential pairs for direction ${direction}`)
      // console.log('Used:')
      // console.log(query)
      // console.log(potentialPairs)

      return potentialPairs
    })
  } catch (err) {
    console.error('An error occurred generating potential pairs')
    console.error(err)
    return []
  }
}

interface PricedPair {
  driver_request_id: number
  rider_request_id: number
  first_date: Date | Raw<any>
  last_date: Date | Raw<any>
  cost: number
  firstPortion: UserRole
}

async function calculatePairsWithCost(direction: TripDirection): Promise<PricedPair[]> {
  const potentialPairs = await generatePotentialPairs(direction)
  const pricedPairs = Array<PricedPair>()

  for (const potential of potentialPairs) {
    // console.log('Pricing potential pair', potential)

    const mtrx = await distanceMatrix(potential.driver_location, potential.rider_location, direction)
    // console.log('Found cost information', mtrx)

    const res = {
      driver_request_id: potential.driver_request_id,
      rider_request_id: potential.rider_request_id,
      first_date: potential.driver_first_date > potential.rider_first_date ? potential.driver_first_date : potential.rider_first_date,
      last_date: potential.driver_last_date < potential.rider_last_date ? potential.driver_last_date : potential.rider_last_date
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
  if (pairs.length === 0) {
    return
  }

  const { driver_request_id, rider_request_id, firstPortion, first_date, last_date } = pairs[0]

  try {
    await db<TripMatch>('trip_matches')
      .insert({
        driver_request_id,
        rider_request_id,
        first_date,
        last_date,
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
