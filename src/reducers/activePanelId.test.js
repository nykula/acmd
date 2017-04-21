/* global expect, it */
const filesActions = require('../actions/files')
const panelsActions = require('../actions/panels')
const reducer = require('./activePanelId').default

it('toggles active panel', () => {
  let state = 0
  const action = panelsActions.toggledActive()

  state = reducer(state, action)
  expect(state).toBe(1)

  state = reducer(state, action)
  expect(state).toBe(0)
})

it('activates panel on selection change', () => {
  let state = 0
  let action = filesActions.cursor({ panelId: 1 })

  state = reducer(state, action)
  expect(state).toBe(1)

  action = filesActions.selected({ panelId: 0 })
  state = reducer(state, action)
  expect(state).toBe(0)
})
