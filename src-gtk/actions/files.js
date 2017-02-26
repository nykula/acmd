exports.cursor = ({panelId, cursor}) => ({
  type: 'CURSOR',
  panelId: panelId,
  cursor: cursor
})

exports.selected = ({panelId, selected}) => ({
  type: 'SELECTED',
  panelId: panelId,
  selected: selected
})
