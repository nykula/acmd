/* global expect, it */
const actions = require('../actions')
const reducer = require('./showHidSys').default

it('toggles hidden file visibility', () => {
  let state = reducer(undefined, {})
  const action = { type: actions.SHOW_HID_SYS }

  state = reducer(state, action)
  expect(state).toEqual(true)

  state = reducer(state, action)
  expect(state).toEqual(false)
})