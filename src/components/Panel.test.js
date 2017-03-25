/* global it */
const h = require('inferno-hyperscript')
const Panel = require('./Panel').default
const { shallow } = require('../utils/Test')

it('renders without crashing', () => {
  shallow(h(Panel, { id: 0 }))
})
