exports.default = function getActiveTabId (state) {
  const activePanelId = state.activePanelId
  const activeTabId = state.panels[activePanelId].activeTabId
  return activeTabId
}
