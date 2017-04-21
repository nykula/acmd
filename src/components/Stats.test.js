/* global expect, it */
const assign = require('lodash/assign')
const h = require('inferno-hyperscript')
const { mapStateToProps, Stats } = require('./Stats')
const { shallow } = require('../utils/Test')

it('renders without crashing', () => {
  const { state, ownProps } = setup()
  const stateProps = mapStateToProps(state, ownProps)
  const props = assign({}, ownProps, stateProps)
  shallow(h(Stats, props))
})

it('counts total size of selected files', () => {
  const { state, ownProps } = setup()
  const stateProps = mapStateToProps(state, ownProps)
  expect(stateProps).toEqual({
    selectedCount: 2,
    totalCount: 4,
    selectedSize: 20,
    totalSize: 60
  })
})

function setup () {
  const state = {
    entities: {
      panels: {
        '0': { activeTabId: 0 }
      },
      tabs: {
        '0': {
          files: [
            {
              name: 'foo',
              size: 0
            },
            {
              name: 'bar',
              size: 10
            },
            {
              name: 'baz',
              size: 20
            },
            {
              name: 'qux',
              size: 30
            }
          ],
          selected: [0, 2]
        }
      }
    }
  }

  const ownProps = { panelId: 0 }

  return {
    state: state,
    ownProps: ownProps
  }
}
