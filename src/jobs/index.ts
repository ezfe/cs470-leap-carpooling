import schedule from 'node-schedule'
import pairingJob from './pairing-job'
import emailJob from './email-job'
import blockExpireJob from './block-expiry'

export default function registerJobs(): void {
  // every 5 seconds
  schedule.scheduleJob('*/5 * * * * *', emailJob)
  schedule.scheduleJob('*/10 * * * *', pairingJob)
  schedule.scheduleJob('*/5 * * * * *', blockExpireJob)
}
