const actions = require('../actions/panels')
const assign = require('lodash/assign')
const filesActions = require('../actions/files')
const getNextTabId = require('../selectors/getNextTabId').default
const tabsActions = require('../actions/tabs')

exports.initialState = {
  activeId: 0,
  tabIds: {
    0: [0],
    1: [1]
  },
  activeTabId: {
    0: 0,
    1: 1
  }
}

exports.default = (_state, action) => {
  let activeTabId
  let index
  let panelId
  const state = _state || exports.initialState
  let tabIds

  switch (action.type) {
    case actions.TOGGLED_ACTIVE:
      return assign({}, state, {
        activeId: state.activeId === 0 ? 1 : 0
      })

    case filesActions.CURSOR:
    case filesActions.SELECTED:
      return assign({}, state, {
        activeId: action.panelId
      })

    case tabsActions.CREATE:
      const tabId = getNextTabId(state)

      tabIds = assign({}, state.tabIds)
      tabIds[action.panelId] = tabIds[action.panelId].concat(tabId)

      activeTabId = assign({}, state.activeTabId)
      activeTabId[action.panelId] = tabId

      return assign({}, state, {
        activeTabId: activeTabId,
        tabIds: tabIds
      })

    case tabsActions.NEXT:
      panelId = action.panelId
      tabIds = state.tabIds[action.panelId]
      index = tabIds.indexOf(state.activeTabId[panelId]) + 1

      if (index >= tabIds.length) {
        index = 0
      }

      activeTabId = assign({}, state.activeTabId)
      activeTabId[action.panelId] = tabIds[index]

      return assign({}, state, {
        activeTabId: activeTabId
      })

    case tabsActions.PREV:
      panelId = action.panelId
      tabIds = state.tabIds[action.panelId]
      index = tabIds.indexOf(state.activeTabId[panelId]) - 1

      if (index < 0) {
        index = tabIds.length - 1
      }

      activeTabId = assign({}, state.activeTabId)
      activeTabId[action.panelId] = tabIds[index]

      return assign({}, state, {
        activeTabId: activeTabId
      })

    case tabsActions.REMOVE:
      tabIds = {
        '0': state.tabIds[0].filter((x, i, xs) => x !== action.id || xs.length === 1),
        '1': state.tabIds[1].filter((x, i, xs) => x !== action.id || xs.length === 1)
      }
      return assign({}, state, {
        activeTabId: {
          '0': state.activeTabId[0] === action.id ? tabIds[0][0] : state.activeTabId[0],
          '1': state.activeTabId[1] === action.id ? tabIds[1][0] : state.activeTabId[1]
        },
        tabIds: tabIds
      })

    default:
      return state
  }
}
