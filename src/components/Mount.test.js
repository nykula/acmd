/* global expect, it */
const assign = require('lodash/assign')
const { createSpy } = require('expect')
const h = require('inferno-hyperscript')
const { Mount, mapStateToProps, mapDispatchToProps } = require('./Mount')
const { shallow } = require('../utils/Test')

it('renders without crashing', () => {
  shallow(h(Mount, assign(
        { panelId: 0 },
        mapStateToProps({
          mounts: {
            active: { 0: 'System' },
            names: ['System'],
            entities: {
              System: {
                name: 'System',
                attributes: { 'filesystem::size': 1 }
              }
            }
          }
        }, { panelId: 0 })
    )))
})

it('dispatches levelUp', () => {
  const dispatch = createSpy().andReturn()
  mapDispatchToProps(dispatch, { panelId: 0 }).onLevelUp()
  expect(dispatch.calls.length).toBe(1)
})
