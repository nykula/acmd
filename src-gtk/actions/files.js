exports.ACTIVATED = 'ACTIVATED'
exports.activated = ({panelId, index}) => ({
  type: exports.ACTIVATED,
  panelId: panelId,
  index: index
})

exports.CURSOR = 'CURSOR'
exports.cursor = ({panelId, cursor}) => ({
  type: exports.CURSOR,
  panelId: panelId,
  cursor: cursor
})

exports.SELECTED = 'SELECTED'
exports.selected = ({panelId, selected}) => ({
  type: exports.SELECTED,
  panelId: panelId,
  selected: selected
})

exports.SORTED = 'SORTED'
exports.sorted = ({by, panelId}) => ({
  type: exports.SORTED,
  panelId: panelId,
  by: by
})
