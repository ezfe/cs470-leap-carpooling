const schedule = require('node-schedule')

const sampleJob = require('./sample-job')

function registerJobs() {
  var sampleRule = new schedule.RecurrenceRule()
  sampleRule.second = 0
  schedule.scheduleJob(sampleRule, sampleJob)
}

module.exports = registerJobs
