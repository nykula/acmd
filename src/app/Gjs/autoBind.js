exports.default = function (self, prototype) {
  const keys = Object.getOwnPropertyNames(prototype)

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    const val = prototype[key]

    if (key !== 'constructor' && typeof val === 'function') {
      self[key] = val.bind(self)
    }
  }
}
