/* global expect, it */
const assign = require('lodash/assign')
const { Prompt, mapStateToProps, mapDispatchToProps } = require('./Prompt')
const h = require('inferno-hyperscript')
const { EXIT } = require('../actions')

it('dispatches action when user activates field', () => {
  const actions = []
  const dispatch = action => actions.push(action)
  const tree = h(Prompt).type(assign({},
        mapStateToProps({
          locations: { 0: 'file:///' },
          panels: { active: 0 }
        }),
        mapDispatchToProps(dispatch)
    ))
  const entry = tree.children.filter(x => x.type === 'entry')[0]
  entry.events.on_activate({ text: '{ type: "EXIT" }' })
  expect(actions).toContain({ type: EXIT })
})
