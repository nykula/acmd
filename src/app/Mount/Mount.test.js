/* global it */
const assign = require('lodash/assign')
const expect = require('expect')
const { createSpy } = require('expect')
const h = require('inferno-hyperscript').default
const { Mount, mapStateToProps, mapDispatchToProps } = require('./Mount')
const { shallow } = require('../Test/Test')

it('renders without crashing', () => {
  shallow(h(Mount, assign(
    { panelId: 0 },
    mapStateToProps({
      entities: {
        panels: {
          '0': { activeTabId: 0 }
        },
        tabs: {
          '0': {
            files: [{
              name: '.',
              mountUri: 'file:///media/System'
            }]
          }
        }
      },
      mounts: {
        names: ['System'],
        entities: {
          System: {
            name: 'System',
            attributes: { 'filesystem::size': 1 },
            rootUri: 'file:///media/System'
          }
        }
      }
    }, { panelId: 0 })
  )))
})

it('dispatches levelUp', () => {
  const dispatch = createSpy().andReturn(undefined)
  mapDispatchToProps(dispatch, { panelId: 0 }).onLevelUp()
  expect(dispatch.calls.length).toBe(1)
})
