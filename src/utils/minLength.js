/**
 * Shortens the string as much as possible without making it confusing.
 */
exports.default = (xs, x) => {
  for (let i = 1; i < x.length; i++) {
    const _x = x.slice(0, i)
    const same = xs.filter(x => x.slice(0, i) === _x).length

    if (same === 1) {
      return _x
    }
  }

  return x
}
