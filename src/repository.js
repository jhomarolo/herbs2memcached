const Convention = require("./convention")
const DataMapper = require("./dataMapper")
const Promiser = require("./promiser")
const { checker } = require('@herbsjs/herbs')
const MAX_EXPIRATION = 2592000  // memcached's max exp in seconds (30 days)

const dependency = { convention: Convention, promiser: Promiser }

module.exports = class Repository {
  constructor(options) {
    const di = Object.assign({}, dependency, options.injection)
    this.convention = di.convention
    this.promiser = di.promiser
    this.keyPrefix = options.keyPrefix
    this.entity = options.entity
    this.entityIDs = options.ids
    this.memcached = options.memcached
    this.dataMapper = new DataMapper(this.entity, this.entityIDs)

    if (!options.hasOwnProperty('maxExpiration')) {
      options.maxExpiration = MAX_EXPIRATION
    }
  }

  async runner() {
    return this.memcached
  }


  /**
  * Set an item in the cache
  * @param {string} key - cache key
  * @param {Object} entityInstance - gotu entity Instance to set in cache
  * @param {number} [expires=900] - expiration of data in seconds
  * @returns {Promise}
  */
  async set(key, entityInstance, expires) {
    const instance = await this.runner()

    if (!expires)
      expires = instance.lifetime
    if (expires > this.maxExpiration)
      throw new Error('Cache.set: Expiration must be no greater than ' + this.maxExpiration + ' seconds.')

    const payload = this.dataMapper.collectionFieldsWithValue(entityInstance)
    return this.promiser.setPromise(instance, this.keyPrefix + key, payload, expires)
  };


  /**
  *
  * Get entities
  *
  * @param {string} key - cache key
  *
  * @return {type} List of entities
  */
  async get(key) {
    const instance = await this.runner()
    const ret = await this.promiser.getPromise(instance, 'get', `${this.keyPrefix}${key}`)

    const entities = []

    if (!ret || checker.isEmpty(ret))
      return entities

    if (checker.isArrayWithType(ret)) {
      for (const row of ret) {
        if (row === undefined) continue
        entities.push(this.dataMapper.toEntity(row))
      }
    }
    else
      entities.push(this.dataMapper.toEntity(ret))

    return entities

  }

}
