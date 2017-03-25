/* global expect, it */
const actions = require('../actions')
const reducer = require('./locations').default

it('sets active tab location on ls success', () => {
  let state = { '0': 'file:///' }

  const action = actions.lsSuccess({
    tabId: 0,
    uri: 'file:///media/System'
  })

  state = reducer(state, action)
  expect(state).toEqual({ '0': 'file:///media/System' })
})
