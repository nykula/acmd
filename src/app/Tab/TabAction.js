exports.CREATE = 'CREATE'
exports.create = function (panelId) {
  return {
    type: exports.CREATE,
    panelId: panelId
  }
}

exports.NEXT = 'NEXT'
exports.next = function (panelId) {
  return {
    type: exports.NEXT,
    panelId: panelId
  }
}

exports.PREV = 'PREV'
exports.prev = function (panelId) {
  return {
    type: exports.PREV,
    panelId: panelId
  }
}

exports.REMOVE = 'REMOVE'
exports.remove = function (id) {
  return {
    type: exports.REMOVE,
    id: id
  }
}
