/* global it */
const assign = require('lodash/assign')
const h = require('inferno-hyperscript')
const { shallow } = require('../utils/Test')
const { TabList, mapStateToProps } = require('./TabList')

it('renders without crashing', () => {
  shallow(h(TabList, assign(
    { panelId: 0 },
    mapStateToProps({
      entities: {
        panels: {
          '0': {
            activeTabId: 0,
            tabIds: [0, 1]
          }
        },
        tabs: {
          '0': { location: 'file:///' },
          '1': { location: 'sftp:///test@example.com/foo/bar' }
        }
      }
    }, { panelId: 0 })
  )))
})
