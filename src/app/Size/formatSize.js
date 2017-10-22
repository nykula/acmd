exports.default = formatSize
function formatSize (size) {
  if (size >= 1000 * 1000 * 1000) {
    return Math.round(size / 1000 / 1000 / 1000) + ' G'
  }

  if (size >= 1000 * 1000) {
    return Math.round(size / 1000 / 1000) + ' M'
  }

  if (size >= 1000) {
    return Math.round(size / 1000) + ' k'
  }

  return size + ' B'
}
