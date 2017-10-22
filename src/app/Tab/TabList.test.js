/* global it */
const assign = require('lodash/assign')
const h = require('inferno-hyperscript')
const { shallow } = require('../Test/Test')
const { TabList, mapStateToProps } = require('./TabList')

it('renders without crashing', () => {
  const state = {
    entities: {
      panels: {
        '0': {
          activeTabId: 0,
          tabIds: [0, 1]
        }
      }
    }
  }

  const ownProps = { panelId: 0 }
  const stateProps = mapStateToProps(state, ownProps)
  const props = assign(ownProps, stateProps)
  shallow(h(TabList, props))
})
