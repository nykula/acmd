/* global expect, it */
const assign = require('lodash/assign')
const { Prompt, mapStateToProps, mapDispatchToProps } = require('./Prompt')
const h = require('inferno-hyperscript')
const { EXEC } = require('../actions')

it('dispatches action when user activates field', () => {
  const actions = []
  const dispatch = action => actions.push(action)
  const tree = h(Prompt).type(assign({},
    mapStateToProps({
      locations: { '0': 'file:///' },
      panels: {
        activeId: 0,
        activeTabId: { '0': 0 }
      }
    }),
    mapDispatchToProps(dispatch)
  ))
  const entry = tree.children.filter(x => x.type === 'entry')[0]
  entry.events.on_activate({ text: 'x-terminal-emulator -e ranger' })
  expect(actions).toContain({ type: EXEC, cmd: 'x-terminal-emulator -e ranger' })
})
