let uuidv4 = require("uuid/v4");

function generateApiKey() {
  let key = uuidv4().replace('-', '').replace('-', '').replace('-', '').replace('-', '')

  // TODO: Save API Key

  return key
}

function verifyApiKey(apikey) {
  if (apikey == undefined) {
    return false
  }

  if (apikey === process.env.API_KEY) {
    return true
  } else {
    return false
  }
}

// Exports
exports.generateApiKey = generateApiKey;
exports.verifyApiKey = verifyApiKey;
