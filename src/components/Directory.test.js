/* global expect, it */
const assign = require('lodash/assign')
const { createSpy } = require('expect')
const {
  Directory,
  mapDispatchToProps,
  mapFileToRow,
  mapStateToProps
} = require('./Directory')
const h = require('inferno-hyperscript')
const { shallow } = require('../utils/Test')

it('renders without crashing', () => {
  shallow(h(Directory, assign(
    { panelId: 0 },
    mapStateToProps({
      activePanelId: 0,
      entities: {
        panels: {
          '0': { activeTabId: 0 }
        },
        tabs: {
          '0': {
            cursor: 0,
            files: [{
              fileType: 'REGULAR',
              icon: 'some gio icon',
              iconType: 'GICON',
              modificationTime: 1490397889,
              name: 'foo.bar',
              size: 1000
            }],
            selected: [],
            sortedBy: '-date'
          }
        }
      },
      showHidSys: false
    }, { panelId: 0 })
  )))
})

it('maps files to table rows', () => {
  let file
  let row

  file = {
    fileType: 'DIRECTORY',
    icon: 'go-up',
    iconType: 'ICON_NAME',
    modificationTime: 1490397889,
    name: '..'
  }
  row = {
    icon: { icon: 'go-up', iconType: 'ICON_NAME' },
    filename: '[..]',
    ext: '',
    size: '<DIR>'
  }
  expect(mapFileToRow(file)).toMatch(row)

  file = {
    fileType: 'DIRECTORY',
    icon: 'folder',
    iconType: 'ICON_NAME',
    modificationTime: 1490397889,
    name: 'Test'
  }
  row = {
    icon: { icon: 'folder', iconType: 'ICON_NAME' },
    filename: '[Test]',
    ext: '',
    size: '<DIR>'
  }
  expect(mapFileToRow(file)).toMatch(row)

  file = {
    fileType: 'REGULAR',
    icon: 'some gio icon',
    iconType: 'GICON',
    modificationTime: 1490397889,
    name: 'foo.bar',
    size: 1000
  }
  row = {
    icon: { icon: 'some gio icon', iconType: 'GICON' },
    filename: 'foo',
    ext: 'bar',
    size: '1 k'
  }
  expect(mapFileToRow(file)).toMatch(row)
})

it('prepends arrow to sorting column title', () => {
  let instance = new Directory({ sortedBy: 'ext' })
  let col = instance.prefixSort({ name: 'ext', title: 'Ext' })
  expect(col.title).toBe('↑Ext')

  instance = new Directory({ sortedBy: '-date' })
  col = instance.prefixSort({ name: 'date', title: 'Date' })
  expect(col.title).toBe('↓Date')

  instance = new Directory({ sortedBy: 'name' })
  col = instance.prefixSort({ name: 'size', title: 'Size' })
  expect(col.title).toBe('Size')
})

it('selects matching file as user types', () => {
  const { handleSearch } = new Directory({
    cursor: 1,
    rows: [
      {
        filename: '[system32]',
        ext: '',
        size: '<DIR>'
      },
      {
        filename: 'Some File Name',
        ext: 'jpeg',
        size: '1048576'
      }
    ]
  })

  const store = {
    get_string_from_iter: x => x
  }

  let skip

  skip = handleSearch(store, null, 'syst', 0)
  expect(skip).toBe(false)
  skip = handleSearch(store, null, 'systt', 0)
  expect(skip).toBe(true)

  skip = handleSearch(store, null, 'some fi', 1)
  expect(skip).toBe(false)
  skip = handleSearch(store, null, 'some fir', 1)
  expect(skip).toBe(false) // Because cursor.
})

it('grabs child focus when isActive becomes true', () => {
  const grabFocus = createSpy().andReturn()

  const prevProps = { isActive: false }
  const props = { isActive: true }

  const instance = new Directory(props)
  instance.refContainer({
    get_children: () => [{ grab_focus: grabFocus }]
  })

  instance.componentDidUpdate(prevProps)
  expect(grabFocus).toHaveBeenCalled()
})

it('dispatches files actions without crashing', () => {
  const dispatch = createSpy().andReturn()
  const props = mapDispatchToProps(dispatch)
  const instance = new Directory(props)
  instance.handleActivated(2)
  instance.handleClicked('ext')
  instance.handleCursor(1)
  instance.handleSelected([1])
  expect(dispatch.calls.length).toBe(4)
})
