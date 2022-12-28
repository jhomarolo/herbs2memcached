const Memcached = require('memcached')
const config = require('./config')

let dbInstance = null

module.exports = async () => {
  Object.assign(this, config)
  if (!this.enabled) return

  if (dbInstance) {
    return new Promise((resolve) => resolve(dbInstance))
  }
  dbInstance = new Memcached(this.server, this.options)
  dbInstance.lifetime = this.lifetime
  return dbInstance

}
