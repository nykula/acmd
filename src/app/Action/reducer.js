const activePanelId = require('../Panel/activePanelId').default
const assign = require('lodash/assign')
const { combineReducers } = require('redux')
const mounts = require('../Mount/mounts').default
const panels = require('../Panel/panels').default
const showHidSys = require('../ShowHidSys/showHidSys').default
const TabAction = require('../Tab/TabAction')
const tabs = require('../Tab/tabs').default

const rootReducer = combineReducers({
  activePanelId: activePanelId,
  mounts: mounts,
  panels: panels,
  showHidSys: showHidSys,
  tabs: tabs
})

exports.default = function (_state, action) {
  const state = rootReducer(_state, action)

  switch (action.type) {
    case TabAction.CREATE: {
      const prevTabId = _state.panels[action.panelId].activeTabId
      const tabId = state.panels[action.panelId].tabIds.slice(-1)[0]

      const entities = assign({}, state, {
        tabs: (tabs => {
          tabs[tabId] = {
            cursor: 0,
            files: tabs[prevTabId].files,
            location: tabs[prevTabId].location,
            selected: [],
            sortedBy: tabs[prevTabId].sortedBy
          }

          return tabs
        })(assign({}, state.tabs))
      })

      return assign({}, state, {
        entities: entities
      })
    }

    default:
      return state
  }
}
