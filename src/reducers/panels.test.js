/* global expect, it */
const actions = require('../actions/panels')
const filesActions = require('../actions/files')
const reducer = require('./panels').default
const tabsActions = require('../actions/tabs')

it('toggles active panel', () => {
  let state = { activeId: 0 }
  const action = actions.toggledActive()

  state = reducer(state, action)
  expect(state).toMatch({ activeId: 1 })

  state = reducer(state, action)
  expect(state).toMatch({ activeId: 0 })
})

it('activates panel on selection change', () => {
  let state = { activeId: 0 }
  let action = filesActions.cursor({ panelId: 1 })

  state = reducer(state, action)
  expect(state).toMatch({ activeId: 1 })

  action = filesActions.selected({ panelId: 0 })
  state = reducer(state, action)
  expect(state).toMatch({ activeId: 0 })
})

it('creates tab in active panel', () => {
  let state = {
    activeId: 0,
    activeTabId: { '0': 0, '1': 1 },
    tabIds: { '0': [0], '1': [1] }
  }

  const action = tabsActions.create(0)
  state = reducer(state, action)

  expect(state).toMatch({
    activeTabId: { '0': 2 },
    tabIds: { '0': [0, 2] }
  })
})

it('switches panel to next tab', () => {
  let state = {
    activeTabId: { '0': 0 },
    tabIds: { '0': [0, 2, 8] }
  }
  const action = tabsActions.next(0)

  state = reducer(state, action)
  expect(state).toMatch({
    activeTabId: { '0': 2 }
  })

  state = reducer(state, action)
  expect(state).toMatch({
    activeTabId: { '0': 8 }
  })

  state = reducer(state, action)
  expect(state).toMatch({
    activeTabId: { '0': 0 }
  })
})

it('switches panel to prev tab', () => {
  let state = {
    activeTabId: { '0': 0 },
    tabIds: { '0': [0, 2, 8] }
  }
  const action = tabsActions.prev(0)

  state = reducer(state, action)
  expect(state).toMatch({
    activeTabId: { '0': 8 }
  })

  state = reducer(state, action)
  expect(state).toMatch({
    activeTabId: { '0': 2 }
  })

  state = reducer(state, action)
  expect(state).toMatch({
    activeTabId: { '0': 0 }
  })
})

it('removes tab in active panel', () => {
  let state = {
    activeId: 1,
    activeTabId: { '0': 0, '1': 1 },
    tabIds: { '0': [0], '1': [1, 2] }
  }

  const action = tabsActions.remove(1)
  state = reducer(state, action)

  expect(state).toMatch({
    activeTabId: { '1': 2 },
    tabIds: { '1': [2] }
  })
})
