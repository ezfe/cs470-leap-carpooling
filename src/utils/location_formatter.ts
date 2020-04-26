export async function locationFormatter(locDesc: string): Promise<{formatted_loc: string}> {
  //const temp =JSON.stringify(locDesc)
  const json  = JSON.parse(locDesc)
  console.log("@@@@@@@@@@@@@")
  console.log(json)
  let finalAddress = ""
  if (json.street_number != "")
    finalAddress = finalAddress+json.street_number+" "
  if( json.street != "")
    finalAddress = finalAddress + json.street+", "
  if( json.locality != "")
    finalAddress = finalAddress + json.locality+", "
  finalAddress = finalAddress + json.state+", "
  finalAddress = finalAddress + json.zip+", USA"
  console.log(json.state)
  return {formatted_loc: finalAddress}
}
