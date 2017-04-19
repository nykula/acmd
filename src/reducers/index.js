const assign = require('lodash/assign')
const { combineReducers } = require('redux/lib')
const entities = require('./entities').default
const locations = require('./locations').default
const mounts = require('./mounts').default
const panels = require('./panels').default
const showHidSys = require('./showHidSys').default
const tabsActions = require('../actions/tabs')

const rootReducer = combineReducers({
  entities: entities,
  locations: locations,
  mounts: mounts,
  panels: panels,
  showHidSys: showHidSys
})

exports.default = function (_state, action) {
  const state = rootReducer(_state, action)

  switch (action.type) {
    case tabsActions.CREATE: {
      const prevTabId = _state.panels.activeTabId[action.panelId]
      const tabId = Object.keys(state.locations).length

      const entities = assign({}, state.entities, {
        tabs: (tabs => {
          tabs[tabId] = {
            cursor: 0,
            files: tabs[prevTabId].files,
            selected: [],
            sortedBy: tabs[prevTabId].sortedBy
          }

          return tabs
        })(assign({}, state.entities.tabs))
      })

      const locations = assign({}, state.locations)
      locations[tabId] = locations[prevTabId]

      return assign({}, state, {
        entities: entities,
        locations: locations
      })
    }

    default:
      return state
  }
}
