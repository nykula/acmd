/* global expect, it */
const actions = require('../actions/files')
const indexActions = require('../actions')
const reducer = require('./files').default

it('saves which file is selected in tab', () => {
  let action
  let state = {
    active: { 0: 0 }
  }

  action = actions.cursor({
    tabId: 0,
    cursor: 1
  })
  state = reducer(state, action)
  expect(state).toEqual({
    active: { 0: 1 }
  })
  action = actions.selected({
    tabId: 0,
    selected: [1]
  })
  expect(reducer(state, action)).toBe(state)

  action = actions.selected({
    tabId: 0,
    selected: [0]
  })
  state = reducer(state, action)
  expect(state).toEqual({
    active: { 0: 0 }
  })
  action = actions.cursor({
    tabId: 0,
    cursor: 0
  })
  expect(reducer(state, action)).toBe(state)
})

it('toggles hidden file visibility', () => {
  let state = { showHidSys: false }
  const action = { type: indexActions.SHOW_HID_SYS }

  state = reducer(state, action)
  expect(state).toEqual({ showHidSys: true })

  state = reducer(state, action)
  expect(state).toEqual({ showHidSys: false })
})

it('sorts files in tab', () => {
  let action
  let state = {
    byTabId: {
      '0': [
        ['config.sub', 2],
        ['usb.ids', 1],
        ['magic.mgc', 0],
        ['pci.ids', 4],
        ['node_modules', 5, true],
        ['config.guess', 3]
      ].map(([name, modificationTime, isDir]) => ({
        name: name,
        modificationTime: modificationTime,
        fileType: isDir ? 'DIRECTORY' : 'REGULAR'
      }))
    },
    sortedBy: {
      '0': undefined
    }
  }

  action = actions.sorted({ tabId: 0, by: 'filename' })
  state = reducer(state, action)
  expect(state.byTabId[0].map(x => x.name)).toEqual([
    'node_modules',
    'config.guess',
    'config.sub',
    'magic.mgc',
    'pci.ids',
    'usb.ids'
  ])

  action = actions.sorted({ tabId: 0, by: 'filename' })
  state = reducer(state, action)
  expect(state.byTabId[0].map(x => x.name)).toEqual([
    'node_modules',
    'usb.ids',
    'pci.ids',
    'magic.mgc',
    'config.sub',
    'config.guess'
  ])

  action = actions.sorted({ tabId: 0, by: 'ext' })
  state = reducer(state, action)
  expect(state.byTabId[0].map(x => x.name)).toEqual([
    'node_modules',
    'config.guess',
    'pci.ids',
    'usb.ids',
    'magic.mgc',
    'config.sub'
  ])

  action = actions.sorted({ tabId: 0, by: 'ext' })
  state = reducer(state, action)
  expect(state.byTabId[0].map(x => x.name)).toEqual([
    'node_modules',
    'config.sub',
    'magic.mgc',
    'usb.ids',
    'pci.ids',
    'config.guess'
  ])

  action = actions.sorted({ tabId: 0, by: 'mtime' })
  state = reducer(state, action)
  expect(state.byTabId[0].map(x => x.name)).toEqual([
    'node_modules',
    'magic.mgc',
    'usb.ids',
    'config.sub',
    'config.guess',
    'pci.ids'
  ])

  action = actions.sorted({ tabId: 0, by: 'mtime' })
  state = reducer(state, action)
  expect(state.byTabId[0].map(x => x.name)).toEqual([
    'node_modules',
    'pci.ids',
    'config.guess',
    'config.sub',
    'usb.ids',
    'magic.mgc'
  ])
})

it('saves files list on ls success', () => {
  let action
  let state = {
    sortedBy: { 0: 'ext' },
    byTabId: { 0: [] }
  }

  action = indexActions.ls(0, 'file:///')
  expect(reducer(state, action)).toBe(state)

  action = indexActions.lsSuccess({
    tabId: 0,
    result: {
      files: [
        ['config.sub', 2],
        ['usb.ids', 1],
        ['magic.mgc', 0],
        ['pci.ids', 4],
        ['node_modules', 5, true],
        ['config.guess', 3]
      ].map(([name, modificationTime, isDir]) => ({
        name: name,
        modificationTime: modificationTime,
        fileType: isDir ? 'DIRECTORY' : 'REGULAR'
      }))
    }
  })
  state = reducer(state, action)
  expect(state.byTabId[0].map(x => x.name)).toEqual([
    'node_modules',
    'config.guess',
    'pci.ids',
    'usb.ids',
    'magic.mgc',
    'config.sub'
  ])
})
