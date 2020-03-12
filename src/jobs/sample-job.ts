import { distanceMatrix } from '../utils/distances'

export default async function job() {
  // do job things!
  console.log('Job triggered!')
  console.log(await distanceMatrix(
    'ChIJd0a7sSC2tEwRkwp8IFR80ko',
    'ChIJly5MDxGYwokR4jAEYCeuMQg',
    true
  ))
}