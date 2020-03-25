import schedule from 'node-schedule'
import sampleJob from './sample-job'

export default function registerJobs() {
  // every 5 seconds
  schedule.scheduleJob('*/5 * * * * *', sampleJob)
}