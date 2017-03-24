exports.default = function getActiveTabId (state, action) {
  const activePanelId = state.panels.activeId
  const activeTabId = state.panels.activeTabId[activePanelId]
  return activeTabId
}
