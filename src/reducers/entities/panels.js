const assign = require('lodash/assign')
const getNextTabId = require('../../selectors/getNextTabId').default
const tabsActions = require('../../actions/tabs')

const initialState = {
  '0': {
    activeTabId: 0,
    tabIds: [0]
  },
  '1': {
    activeTabId: 1,
    tabIds: [1]
  }
}

exports.default = panels
function panels (state, action) {
  let index
  let panelId
  state = state || initialState
  let tabIds

  switch (action.type) {
    case tabsActions.CREATE:
      const tabId = getNextTabId(state)

      return set(state, action.panelId, {
        activeTabId: tabId,
        tabIds: state[action.panelId].tabIds.concat(tabId)
      })

    case tabsActions.NEXT:
      panelId = action.panelId
      tabIds = state[action.panelId].tabIds
      index = tabIds.indexOf(state[panelId].activeTabId) + 1

      if (index >= tabIds.length) {
        index = 0
      }

      return set(state, action.panelId, {
        activeTabId: tabIds[index]
      })

    case tabsActions.PREV:
      panelId = action.panelId
      tabIds = state[action.panelId].tabIds
      index = tabIds.indexOf(state[panelId].activeTabId) - 1

      if (index < 0) {
        index = tabIds.length - 1
      }

      return set(state, action.panelId, {
        activeTabId: tabIds[index]
      })

    case tabsActions.REMOVE:
      panelId = state[0].tabIds.indexOf(action.id) > -1 ? 0 : 1
      const isActive = state[panelId].activeTabId === action.id
      const isOnly = state[panelId].tabIds.length === 1
      tabIds = isOnly ? state[panelId].tabIds : state[panelId].tabIds.filter(x => x !== action.id)

      return set(state, panelId, {
        activeTabId: isActive ? tabIds[0] : state[panelId].activeTabId,
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
