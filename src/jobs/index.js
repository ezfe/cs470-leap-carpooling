const schedule = require('node-schedule')

const sampleJob = require('./sample-job')

function registerJobs() {
  var sampleRule = new schedule.RecurrenceRule()
  sampleRule.second = 0 // every time the second is zero --> every minute
  schedule.scheduleJob(sampleRule, sampleJob)
}

module.exports = registerJobs
