const db = require('../db')
const distanceMatrix = require('../utils/distances')

async function job() {
  const pairs = await processDirection('towards_lafayette')
  pairs.sort((a, b) => { return a.cost < b.cost })
  findPairs(pairs)
}
async function findPairs(pairs) {
  try {
    const records = await db('trip_matches')
      .returning('*')
      .insert({
        driver_request_id: pairs[0].driverRec.id,
        rider_request_id: pairs[0].riderRec.id,
        date : "some date",
        time: "morning",
        rider_confirmed = 'false',
        driver_confirmed = 'true',
        created_at

      })
  } catch (err) {
    console.error("there was a database issue")
  }
  //add the match to the table
  //delete all records with rider and driver requests 
}

async function processDirection(direction) {
  try {
    const driverRecords = await db('trip_requests')
      .where({ role: 'driver', direction: direction })
      .select('*')
    console.log(driverRecords)

    const riderRecords = await db('trip_requests')
      .where({ role: 'rider', direction: direction })
      .select('*')
    console.log(riderRecords)

    let arr = []
    for (const driverRecord of driverRecords) {
      for (const riderRecord of driverRecords) {
        const { driverCost, riderCost } = distanceMatrix(driverRecord.location, riderRecord.location, direction)
        if (driverCost < driverRecord.deviation_limit) {
          if (riderCost < riderRecord.deviation_limit) {
            if (riderCost < driverCost) {
              arr.push({
                driverRec: driverRecord, riderRec: riderRecord, cost: riderCost
              })
            } else {
              arr.push({
                driverRec: driverRecord, riderRec: riderRecord, cost: driverCost
              })
            }
          }
          else {
            arr.push({
              driverRec: driverRecord, riderRec: riderRecord, cost: driverCost
            })
          }
        }
        else if (riderCost < riderRecord.deviation_limit) {
          arr.push({
            driverRec: driverRecord, riderRec: riderRecord, cost: riderCost
          })
        }
      }
    }
    // need to return pair and the cost
    return arr
  } catch (err) {
    console.error('in the catch')
    // res.render('database-error')
  }
}

module.exports = job
