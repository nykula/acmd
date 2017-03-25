/* global expect, it */
const reducer = require('.').default
const tabsActions = require('../actions/tabs')

it('clones active tab when creating a new one', () => {
  let state = {
    files: {
      active: {
        '0': 1,
        '1': 0
      },
      byTabId: {
        '0': [{ name: 'foo' }, { name: 'bar' }],
        '1': [{ name: 'foo' }, { name: 'bar' }]
      },
      sortedBy: {
        '0': '-date',
        '1': 'name'
      }
    },
    locations: {
      '0': 'file:///',
      '1': 'file:///'
    },
    panels: {
      activeTabId: { '0': 0, '1': 1 },
      tabIds: { '0': [0], '1': [1] }
    }
  }

  const action = tabsActions.create(0)

  state = reducer(state, action)

  expect(state).toMatch({
    files: {
      active: {
        '0': 1,
        '1': 0,
        '2': 1
      },
      byTabId: {
        '0': [{ name: 'foo' }, { name: 'bar' }],
        '1': [{ name: 'foo' }, { name: 'bar' }],
        '2': [{ name: 'foo' }, { name: 'bar' }]
      },
      sortedBy: {
        '0': '-date',
        '1': 'name',
        '2': '-date'
      }
    },
    locations: {
      '0': 'file:///',
      '1': 'file:///',
      '2': 'file:///'
    },
    panels: {
      activeTabId: { '0': 2, '1': 1 },
      tabIds: { '0': [0, 2], '1': [1] }
    }
  })
})
