/* global expect, it */
const { createSpy } = require('expect')
const { Location, mapStateToProps } = require('./Location')

it('renders without crashing', () => {
  new Location().render({
    location: 'file:///'
  })
})

it('selects row when isActive becomes true', () => {
  const selectRow = createSpy().andReturn()
  const row = {}

  const prevProps = { isActive: false }
  const props = { isActive: true }

  const instance = new Location(props)
  instance.refRow(row)
  instance.refList({ select_row: selectRow })

  instance.componentDidUpdate(prevProps)
  expect(selectRow).toHaveBeenCalledWith(row)
})

it('unselects row when isActive becomes false', () => {
  const unselectRow = createSpy().andReturn()
  const row = {}

  const prevProps = { isActive: true }
  const props = { isActive: false }

  const instance = new Location(props)
  instance.refRow(row)
  instance.refList({ unselect_row: unselectRow })

  instance.componentDidUpdate(prevProps)
  expect(unselectRow).toHaveBeenCalledWith(row)
})

it('maps state to expected props', () => {
  const state = {
    entities: {
      tabs: {
        '1': {
          location: 'file:///'
        }
      }
    },
    panels: {
      activeId: 0,
      activeTabId: { '0': 1 }
    }
  }
  const ownProps = { panelId: 0 }
  const props = mapStateToProps(state, ownProps)
  expect(props).toMatch({
    isActive: true,
    location: 'file:///'
  })
})
