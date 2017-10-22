/* global it */
const assign = require('lodash/assign')
const h = require('inferno-hyperscript')
const noop = require('lodash/noop')
const { shallow } = require('../Test/Test')
const {
  TabListItem,
  mapStateToProps,
  mapDispatchToProps
} = require('./TabListItem')

it('renders without crashing', () => {
  let ownProps
  let props
  let stateProps
  const state = {
    entities: {
      tabs: {
        '0': { location: 'file:///' },
        '1': { location: 'sftp:///test@example.com/foo/bar' }
      }
    }
  }

  ownProps = {
    id: 0,
    panelId: 1
  }
  stateProps = mapStateToProps(state, ownProps)
  props = assign(ownProps, stateProps)
  shallow(h(TabListItem, props))

  ownProps = {
    id: 1,
    panelId: 1
  }
  stateProps = mapStateToProps(state, ownProps)
  props = assign(ownProps, stateProps)
  shallow(h(TabListItem, props))
})

it('requests active tab change on click without crashing', () => {
  const ownProps = {
    id: 0,
    panelId: 0
  }

  const props = mapDispatchToProps(noop, ownProps)
  props.onClicked()
})
