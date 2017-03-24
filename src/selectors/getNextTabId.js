exports.default = function (panels) {
  const ids = panels.tabIds[0].concat(panels.tabIds[1])
  return Math.max.apply(null, ids) + 1
}
