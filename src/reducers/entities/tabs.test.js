/* global expect, it */
const filesActions = require('../../actions/files')
const reducer = require('./tabs').default

it('saves cursor', () => {
  let state = {
    '1': {
      cursor: 0,
      selected: []
    }
  }

  const action = filesActions.cursor({
    tabId: 1,
    cursor: 2
  })
  state = reducer(state, action)
  expect(state[1].cursor).toEqual(2)
})

it('saves selected', () => {
  let state = {
    '1': {
      cursor: 0,
      selected: []
    }
  }

  const action = filesActions.selected({
    tabId: 1,
    selected: [3, 4, 5]
  })
  state = reducer(state, action)
  expect(state[1].selected).toEqual([3, 4, 5])
})