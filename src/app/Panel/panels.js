const assign = require('lodash/assign')
const getNextTabId = require('../Panel/getNextTabId').default
const getPanelIdByTabId = require('../Action/getPanelIdByTabId').default
const indexActions = require('../Action/Action')
const PanelAction = require('./PanelAction')
const TabAction = require('../Tab/TabAction')

const initialState = {
  '0': {
    activeTabId: 0,
    history: ['file:///'],
    now: 0,
    tabIds: [0]
  },
  '1': {
    activeTabId: 1,
    history: ['file:///'],
    now: 0,
    tabIds: [1]
  }
}

exports.default = panels
function panels (state, action) {
  let index
  let panel
  let panelId
  state = state || initialState
  let tabIds

  switch (action.type) {
    case indexActions.LS: {
      if (action.result) {
        panelId = getPanelIdByTabId(state, action.tabId)
        panel = state[panelId]

        return set(state, panelId, {
          history: action.delta ? panel.history : panel.history.slice(0, panel.now + 1).concat(action.uri),
          now: action.delta ? panel.now + action.delta : panel.now + 1
        })
      } else {
        return state
      }
    }

    case PanelAction.ACTIVE_TAB_ID:
      return set(state, action.panelId, {
        activeTabId: action.tabId
      })

    case TabAction.CREATE:
      const tabId = getNextTabId(state)

      return set(state, action.panelId, {
        activeTabId: tabId,
        tabIds: state[action.panelId].tabIds.concat(tabId)
      })

    case TabAction.NEXT:
      panelId = action.panelId
      tabIds = state[action.panelId].tabIds
      index = tabIds.indexOf(state[panelId].activeTabId) + 1

      if (index >= tabIds.length) {
        index = 0
      }

      return set(state, action.panelId, {
        activeTabId: tabIds[index]
      })

    case TabAction.PREV:
      panelId = action.panelId
      tabIds = state[action.panelId].tabIds
      index = tabIds.indexOf(state[panelId].activeTabId) - 1

      if (index < 0) {
        index = tabIds.length - 1
      }

      return set(state, action.panelId, {
        activeTabId: tabIds[index]
      })

    case TabAction.REMOVE:
      panelId = getPanelIdByTabId(state, action.id)
      index = state[panelId].tabIds.indexOf(action.id)
      const isActive = state[panelId].activeTabId === action.id
      const isOnly = state[panelId].tabIds.length === 1
      tabIds = isOnly ? state[panelId].tabIds : state[panelId].tabIds.filter(x => x !== action.id)
      index = Math.min(index, tabIds.length - 1)

      return set(state, panelId, {
        activeTabId: isActive ? tabIds[index] : state[panelId].activeTabId,
        tabIds: tabIds
      })

    default:
      return state
  }
}

exports.set = set
function set (state, id, data) {
  state = assign({}, state)
  state[id] = assign({}, state[id], data)

  return state
}
