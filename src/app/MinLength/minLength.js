/**
 * Shortens the string as much as possible without making it confusing.
 *
 * @param {string[]} xs
 * @param {string} x
 */
exports.default = (xs, x) => {
  for (let i = 1; i < x.length; i++) {
    const short = x.slice(0, i);
    const same = xs.filter(other => other.slice(0, i) === short).length;

    if (same === 1) {
      return short;
    }
  }

  return x;
};
