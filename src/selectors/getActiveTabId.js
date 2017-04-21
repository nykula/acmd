exports.default = function getActiveTabId (state) {
  const activePanelId = state.activePanelId
  const activeTabId = state.entities.panels[activePanelId].activeTabId
  return activeTabId
}
