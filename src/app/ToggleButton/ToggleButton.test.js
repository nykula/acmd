/* global it */
const expect = require('expect')
const h = require('inferno-hyperscript').default
const noop = require('lodash/noop')
const { shallow } = require('../Test/Test')
const ToggleButton = require('./ToggleButton').default

it('renders without crashing', () => {
  shallow(h(ToggleButton, {
    active: false,
    on_clicked: noop
  }, []))
})

it('resets active on ref store', () => {
  const instance = new ToggleButton({ active: true })
  const { node } = setup()
  instance.ref(node)
  expect(node.active).toBe(true)
})

it('resets active on update', () => {
  const instance = new ToggleButton({ active: false })
  const { node } = setup()
  instance.ref(node)
  instance.componentDidUpdate()
  expect(node.active).toBe(false)
})

it('does not crash on reset attempt with null ref', () => {
  const instance = new ToggleButton({ active: false })
  instance.resetActive()
})

function setup () {
  function Node () {
    this.active = null
    this.set_state_flags = () => { this.active = true }
    this.unset_state_flags = () => { this.active = false }
  }

  return {
    node: new Node()
  }
}
