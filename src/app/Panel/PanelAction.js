const ACTIVE_TAB_ID = exports.ACTIVE_TAB_ID = 'ACTIVE_TAB_ID'
exports.activeTabId = ({ panelId, tabId }) => ({
  type: ACTIVE_TAB_ID,
  panelId: panelId,
  tabId: tabId
})

const TOGGLED_ACTIVE = exports.TOGGLED_ACTIVE = 'TOGGLED_ACTIVE'
exports.toggledActive = () => ({
  type: TOGGLED_ACTIVE
})
