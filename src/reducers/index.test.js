/* global expect, it */
const reducer = require('.').default
const tabsActions = require('../actions/tabs')

it('clones active tab when creating a new one', () => {
  let state = {
    entities: {
      tabs: {
        '0': {
          cursor: 1,
          files: [{ name: 'foo' }, { name: 'bar' }],
          location: 'file:///',
          selected: [],
          sortedBy: '-date'
        },
        '1': {
          cursor: 0,
          files: [{ name: 'foo' }, { name: 'bar' }],
          location: 'file:///',
          selected: [],
          sortedBy: 'name'
        }
      }
    },
    panels: {
      activeTabId: { '0': 0, '1': 1 },
      tabIds: { '0': [0], '1': [1] }
    }
  }

  const action = tabsActions.create(0)

  state = reducer(state, action)

  expect(state).toMatch({
    entities: {
      tabs: {
        '0': {
          cursor: 1,
          files: [{ name: 'foo' }, { name: 'bar' }],
          location: 'file:///',
          selected: [],
          sortedBy: '-date'
        },
        '1': {
          cursor: 0,
          files: [{ name: 'foo' }, { name: 'bar' }],
          location: 'file:///',
          selected: [],
          sortedBy: 'name'
        },
        '2': {
          cursor: 0,
          files: [{ name: 'foo' }, { name: 'bar' }],
          location: 'file:///',
          selected: [],
          sortedBy: '-date'
        }
      }
    },
    panels: {
      activeTabId: { '0': 2, '1': 1 },
      tabIds: { '0': [0, 2], '1': [1] }
    }
  })
})
