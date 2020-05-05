import schedule from 'node-schedule'
import blockExpireJob from './block-expiry'
import emailJob from './email-job'
import pairingJob from './pairing-job'

/**
 * Register all the jobs that run periodically on the
 * server.
 */
export default function registerJobs(): void {
  /*
    To learn more about the syntax for these jobs,
    the documentation is located at:
    https://github.com/node-schedule/node-schedule
  */

  // every 5 seconds
  schedule.scheduleJob('*/5 * * * * *', emailJob)

  // every 10 minutes
  schedule.scheduleJob('*/10 * * * *', pairingJob)
  schedule.scheduleJob('*/10 * * * *', blockExpireJob)
}
