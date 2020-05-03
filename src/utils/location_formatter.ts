type FormatOption = 'full' | 'trip_list' | 'city'

export function formatLocation(locationDescription: string, method: FormatOption): string {
  if (method == 'full') {
    return locationFormatter(locationDescription)
  } else if (method == 'city') {
    return cityFormatter(locationDescription)
  } else if (method == 'trip_list') {
    return tripListFormatter(locationDescription)
  } else {
    return `Invalid Location Format Method: ${method}`
  }
}

function locationFormatter(locDesc: string): string {
  const json = JSON.parse(locDesc)

  let finalAddress = ''
  if (json.street) {
    if (json.street_number) {
      finalAddress = `${json.street_number} ${json.street}, `
    } else {
      finalAddress = `${json.street}, `
    }
  }

  if (json.state) {
    if (json.locality) {
      if (json.zip) {
        finalAddress = `${finalAddress}${json.locality}, ${json.state} ${json.zip} USA`
      } else {
        finalAddress = `${finalAddress}${json.locality}, ${json.state}, USA`
      }
    } else {
      finalAddress = `${finalAddress}${json.state}, USA`
    }
  }

  return finalAddress
}

function cityFormatter(locDesc: string): string {
  const json = JSON.parse(locDesc)

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

function tripListFormatter(locDesc: string): string {
  const json = JSON.parse(locDesc)

  if (json.street) {
    if (json.street_number) {
      return `${json.street_number} ${json.street}`
    } else {
      return json.street
    }
  } else if (json.state) {
    if (json.locality) {
      return `${json.locality}, ${json.state}`
    } else {
      return json.state
    }
  } else {
    console.error('Missing Location Information')
    console.error(locDesc)
    console.error(json)
    return 'Missing Location Information'
  }
}
