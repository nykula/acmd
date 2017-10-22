/* global it */
const { ActionBar, mapDispatchToProps } = require('./ActionBar')
const expect = require('expect')
const { find } = require('../Test/Test')
const { VIEW } = require('../Action/Action')

it('dispatches action without payload', () => {
  const actions = []
  const dispatch = action => actions.push(action)
  const tree = ActionBar(mapDispatchToProps(dispatch))
  const button = find(tree, x => x.type === 'button')
  button.events.on_pressed()
  expect(actions).toContain({ type: VIEW })
})
