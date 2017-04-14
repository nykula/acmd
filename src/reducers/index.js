const assign = require('lodash/assign')
const { combineReducers } = require('redux/lib')
const entities = require('./entities').default
const files = require('./files').default
const locations = require('./locations').default
const mounts = require('./mounts').default
const panels = require('./panels').default
const tabsActions = require('../actions/tabs')

const rootReducer = combineReducers({
  entities: entities,
  files: files,
  locations: locations,
  mounts: mounts,
  panels: panels
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
            selected: []
          }

          return tabs
        })(assign({}, state.entities.tabs))
      })

      const files = (files => {
        const sortedBy = assign({}, files.sortedBy)
        sortedBy[tabId] = sortedBy[prevTabId]

        const byTabId = assign({}, files.byTabId)
        byTabId[tabId] = byTabId[prevTabId]

        return assign({}, files, {
          sortedBy: sortedBy,
          byTabId: byTabId
        })
      })(state.files)

      const locations = assign({}, state.locations)
      locations[tabId] = locations[prevTabId]

      return assign({}, state, {
        entities: entities,
        files: files,
        locations: locations
      })
    }

    default:
      return state
  }
}
