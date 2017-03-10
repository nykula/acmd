/* global expect, it */
const { Toolbar, mapDispatchToProps } = require('./Toolbar')
const h = require('inferno-hyperscript')
const { REFRESH } = require('../actions')

it('dispatches action without payload', () => {
  const actions = []
  const dispatch = action => actions.push(action)
  const tree = h(Toolbar).type(mapDispatchToProps(dispatch))
  tree.children.filter(x => x.type === 'button')[0].events.on_pressed()
  expect(actions).toContain({ type: REFRESH })
})
