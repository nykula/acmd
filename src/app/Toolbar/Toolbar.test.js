/* global it */
const assign = require('lodash/assign')
const expect = require('expect')
const { Toolbar, mapStateToProps, mapDispatchToProps } = require('./Toolbar')
const h = require('inferno-hyperscript')
const { REFRESH } = require('../Action/Action')
const { shallow } = require('../Test/Test')

it('dispatches action without payload', () => {
  const actions = []
  const dispatch = action => actions.push(action)
  const tree = shallow(h(Toolbar, assign(
    {},
    mapStateToProps({
      showHidSys: true
    }),
    mapDispatchToProps(dispatch)
  )))
  tree.children[0].props.on_pressed()
  expect(actions).toContain({ type: REFRESH })
})
