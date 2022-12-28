module.exports = class Promiser {
  static getPromise(instance, method, key) {
    return new Promise((resolve, reject) => {
      const cb = (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      }

      if (key) {
        instance[method](key, cb)
      } else {
        instance[method](cb)
      }
    })
  }

  static setPromise(instance, key, value, expires) {
    return new Promise((resolve, reject) => {
      instance.set(key, value, expires, (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
  }
}
