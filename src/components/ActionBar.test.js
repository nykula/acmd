/* global expect, it */
const { ActionBar, mapDispatchToProps } = require('./ActionBar')
const h = require('inferno-hyperscript')
const { VIEW } = require('../actions')

it('dispatches action without payload', () => {
  const actions = []
  const dispatch = action => actions.push(action)
  const tree = h(ActionBar).type(mapDispatchToProps(dispatch))
  tree.children.filter(x => x.type === 'button')[0].events.on_pressed()
  expect(actions).toContain({ type: VIEW })
})
