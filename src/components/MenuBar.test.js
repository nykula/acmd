/* global it */
const { MenuBar } = require('./MenuBar')
const h = require('inferno-hyperscript')

it('renders without crashing', () => {
  h(MenuBar).type()
})
