import schedule from 'node-schedule'
import sampleJob from './pairing-job'
import emailJob from './email-job'

export default function registerJobs() {
  // every 5 seconds
  schedule.scheduleJob('*/5 * * * * *', emailJob)
  schedule.scheduleJob('*/10 * * * *', sampleJob)
}

