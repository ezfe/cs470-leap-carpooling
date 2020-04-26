export async function locationFormatter(locDesc: string): Promise<string> {
  const json = JSON.parse(locDesc)

  console.log('@@@@@@@@@@@@@')
  console.log(json)

  let finalAddress = ''
  if (json.street_number) {
    finalAddress = `${finalAddress}${json.street_number} `
  }

  if (json.street) {
    finalAddress = `${finalAddress}${json.street} `
  }

  if (json.locality) {
    finalAddress = `${finalAddress}${json.locality}, `
  }

  finalAddress = `${finalAddress}${json.state} ${json.zip} USA`

  return finalAddress
}

export async function cityFormatter(locDesc: string): Promise<string> {
  const json = JSON.parse(locDesc)
  console.log('@@@@@@@@@@@@@')
  console.log(json)

  if (json.locality && json.state) {
    return `${json.locality}, ${json.state}`
  } else if (json.state) {
    return json.state
  } else {
    console.error('Missing location information')
    console.error(locDesc)
    console.error(json)
    return 'Missing Location Information'
  }
}
