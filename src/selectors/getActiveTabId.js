exports.default = function getActiveTabId (state) {
  const activePanelId = state.panels.activeId
  const activeTabId = state.panels.activeTabId[activePanelId]
  return activeTabId
}
