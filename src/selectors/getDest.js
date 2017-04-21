exports.default = function getDest (state) {
  const destPanelId = state.activePanelId === 0 ? 1 : 0
  const destTabId = state.entities.panels[destPanelId].activeTabId
  const dest = state.entities.tabs[destTabId].location
  return dest
}
