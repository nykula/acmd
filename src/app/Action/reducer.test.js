/* global it */
const expect = require('expect')
const reducer = require('./reducer').default
const TabAction = require('../Tab/TabAction')

it('clones active tab when creating a new one', () => {
  let state = {
    entities: {
      panels: {
        '0': {
          activeTabId: 0,
          tabIds: [0]
        },
        '1': {
          activeTabId: 1,
          tabIds: [1]
        }
      },
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
    }
  }

  const action = TabAction.create(0)

  state = reducer(state, action)

  expect(state).toMatch({
    entities: {
      panels: {
        '0': {
          activeTabId: 2,
          tabIds: [0, 2]
        },
        '1': {
          activeTabId: 1,
          tabIds: [1]
        }
      },
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
    }
  })
})
