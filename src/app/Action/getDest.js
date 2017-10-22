/**
 * @param {*} state
 */
exports.default = function getDest (state) {
  const destPanelId = state.activePanelId === 0 ? 1 : 0
  const destTabId = state.panels[destPanelId].activeTabId
  const dest = state.tabs[destTabId].location
  return dest
}
