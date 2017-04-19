exports.default = function getDest (state) {
  const destPanelId = state.panels.activeId === 0 ? 1 : 0
  const destTabId = state.panels.activeTabId[destPanelId]
  const dest = state.entities.tabs[destTabId].location
  return dest
}
