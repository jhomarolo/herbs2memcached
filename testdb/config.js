// Load .env files
const dotenv = require('dotenv')
const result = dotenv.config()
if (result.error) { throw result.error }

const cacheSettings = {
  server: process.env.SERVER_URL || 'localhost:11211',
  lifetime: process.env.SERVER_MAX_EXPIRATION ? Number(process.env.SERVER_MAX_EXPIRATION): 120, //default to 120 seconds
  options: {
    retries: process.env.SERVER_RETRIES,
    retry: process.env.SERVER_RETRY
  },
  enabled: !!process.env.SERVER_ENABLED ? process.env.SERVER_ENABLED.toLocaleLowerCase() === 'true' : false
}

module.exports = Object.freeze(cacheSettings)