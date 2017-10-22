/* global it */
const expect = require('expect')
const FileAction = require('../File/FileAction')
const PanelAction = require('../Panel/PanelAction')
const reducer = require('./activePanelId').default

it('toggles active panel', () => {
  let state = 0
  const action = PanelAction.toggledActive()

  state = reducer(state, action)
  expect(state).toBe(1)

  state = reducer(state, action)
  expect(state).toBe(0)
})

it('activates panel on selection change', () => {
  let state = 0
  let action = FileAction.cursor({ panelId: 1 })

  state = reducer(state, action)
  expect(state).toBe(1)

  action = FileAction.selected({ panelId: 0 })
  state = reducer(state, action)
  expect(state).toBe(0)
})
