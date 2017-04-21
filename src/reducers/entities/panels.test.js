/* global expect, it */
const reducer = require('./panels').default
const tabsActions = require('../../actions/tabs')

it('creates tab in panel', () => {
  let state = {
    '0': {
      activeTabId: 0,
      tabIds: [0]
    },
    '1': {
      activeTabId: 1,
      tabIds: [1]
    }
  }

  const action = tabsActions.create(0)
  state = reducer(state, action)

  expect(state).toMatch({
    '0': {
      activeTabId: 2,
      tabIds: [0, 2]
    }
  })
})

it('switches panel to next tab', () => {
  let state = {
    '0': {
      activeTabId: 0,
      tabIds: [0, 2, 8]
    }
  }
  const action = tabsActions.next(0)

  state = reducer(state, action)
  expect(state[0].activeTabId).toBe(2)

  state = reducer(state, action)
  expect(state[0].activeTabId).toBe(8)

  state = reducer(state, action)
  expect(state[0].activeTabId).toBe(0)
})

it('switches panel to prev tab', () => {
  let state = {
    '0': {
      activeTabId: 0,
      tabIds: [0, 2, 8]
    }
  }
  const action = tabsActions.prev(0)

  state = reducer(state, action)
  expect(state[0].activeTabId).toBe(8)

  state = reducer(state, action)
  expect(state[0].activeTabId).toBe(2)

  state = reducer(state, action)
  expect(state[0].activeTabId).toBe(0)
})

it('removes tab in panel', () => {
  let state = {
    '0': {
      activeTabId: 0,
      tabIds: [0]
    },
    '1': {
      activeTabId: 1,
      tabIds: [1, 2]
    }
  }

  const action = tabsActions.remove(1)
  state = reducer(state, action)

  expect(state).toMatch({
    '1': {
      activeTabId: 2,
      tabIds: [2]
    }
  })
})
