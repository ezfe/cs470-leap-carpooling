const schedule = require('node-schedule')

const sampleJob = require('./sample-job')

function registerJobs() {
  schedule.scheduleJob('*/5 * * * * *', sampleJob)
}

module.exports = registerJobs
