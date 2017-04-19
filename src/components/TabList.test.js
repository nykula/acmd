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
        tabs: {
          '0': { location: 'file:///' },
          '1': { location: 'sftp:///test@example.com/foo/bar' }
        }
      },
      panels: {
        tabIds: { '0': [0, 1] },
        activeTabId: { '0': 0 }
      }
    }, { panelId: 0 })
  )))
})
