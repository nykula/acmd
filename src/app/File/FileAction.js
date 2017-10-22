exports.ACTIVATED = 'ACTIVATED'
exports.activated = ({ panelId, tabId, index }) => ({
  type: exports.ACTIVATED,
  panelId: panelId,
  tabId: tabId,
  index: index
})

exports.CURSOR = 'CURSOR'
exports.cursor = ({ panelId, tabId, cursor }) => ({
  type: exports.CURSOR,
  panelId: panelId,
  tabId: tabId,
  cursor: cursor
})

exports.SELECTED = 'SELECTED'
exports.selected = ({ panelId, tabId, selected }) => ({
  type: exports.SELECTED,
  panelId: panelId,
  tabId: tabId,
  selected: selected
})

exports.SORTED = 'SORTED'
exports.sorted = ({ by, tabId }) => ({
  type: exports.SORTED,
  tabId: tabId,
  by: by
})
