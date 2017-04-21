exports.default = getActiveMountUri
function getActiveMountUri (state, panelId) {
  const tabId = state.entities.panels[panelId].activeTabId
  const files = state.entities.tabs[tabId].files

  for (var i = 0; i < files.length; i++) {
    if (files[i].name === '.') {
      return files[i].mountUri
    }
  }

  return 'file:///'
}
