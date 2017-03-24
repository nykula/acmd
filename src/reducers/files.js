const actions = require('../actions/files')
const assign = require('lodash/assign')
const indexActions = require('../actions')
const orderBy = require('lodash/orderBy')

const sampleFiles = [
  {
    name: '..',
    fileType: 'DIRECTORY',
    icon: 'folder',
    iconType: 'ICON_NAME',
    size: 0,
    modificationTime: Date.now(),
    mode: '0755'
  },
  {
    name: 'clan in da front.txt',
    icon: 'text-x-generic',
    iconType: 'ICON_NAME',
    size: 4110,
    modificationTime: Date.now(),
    mode: '0644'
  }
]

const initialState = {
  active: {
    0: 0,
    1: 0
  },
  sortedBy: {
    0: 'ext',
    1: 'ext'
  },
  byTabId: {
    0: sampleFiles,
    1: sampleFiles
  },
  showHidSys: false
}

exports.default = (_state, payload) => {
  const state = _state || initialState
  let by
  let files

  switch (payload.type) {
    case actions.CURSOR: {
      if (state.active[payload.tabId] === payload.cursor) {
        return state
      }
      return assign({}, state, {
        active: (() => {
          const active = assign({}, state.active)
          active[payload.tabId] = payload.cursor
          return active
        })()
      })
    }

    case actions.SELECTED: {
      if (
        payload.selected.length === 1 &&
        state.active[payload.tabId] !== payload.selected[0]
      ) {
        return assign({}, state, {
          active: (() => {
            const active = assign({}, state.active)
            active[payload.tabId] = payload.selected[0]
            return active
          })()
        })
      } else {
        return state
      }
    }

    case indexActions.SHOW_HID_SYS:
      return assign({}, state, {
        showHidSys: !state.showHidSys
      })

    case actions.SORTED: {
      by = exports.nextSort(state.sortedBy[payload.tabId], payload.by)
      files = exports.sortFiles(by, state.byTabId[payload.tabId])
      return assign({}, state, {
        sortedBy: (() => {
          const sortedBy = assign({}, state.sortedBy)
          sortedBy[payload.tabId] = by
          return sortedBy
        })(),
        byTabId: (() => {
          const byTabId = assign({}, state.byTabId)
          byTabId[payload.tabId] = files
          return byTabId
        })()
      })
    }

    case indexActions.LS: {
      if (payload.result) {
        by = state.sortedBy[payload.tabId]
        files = exports.sortFiles(by, payload.result.files)
        return assign({}, state, {
          byTabId: (() => {
            const byTabId = assign({}, state.byTabId)
            byTabId[payload.tabId] = files
            return byTabId
          })()
        })
      } else {
        return state
      }
    }

    default:
      return state
  }
}

exports.nextSort = (prevBy, by) => {
  if (by === 'filename' && prevBy !== 'filename') {
    return 'filename'
  }
  if (by === 'filename' && prevBy === 'filename') {
    return '-filename'
  }
  if (by === 'ext' && prevBy !== 'ext') {
    return 'ext'
  }
  if (by === 'ext' && prevBy === 'ext') {
    return '-ext'
  }
  if (by === 'mtime' && prevBy !== 'mtime') {
    return 'mtime'
  }
  if (by === 'mtime' && prevBy === 'mtime') {
    return '-mtime'
  }
  return prevBy
}

exports.sortFiles = (by, files) => {
  switch (by) {
    case 'filename':
      return orderBy(
        files,
        [
          x => x.fileType === 'DIRECTORY',
          x => x.name.toLowerCase()
        ],
        ['desc', 'asc']
      )

    case '-filename':
      return orderBy(
        files,
        [
          x => x.fileType === 'DIRECTORY',
          x => x.name.toLowerCase()
        ],
        ['desc', 'desc']
      )

    case 'ext':
      return orderBy(
        files,
        [
          x => x.fileType === 'DIRECTORY',
          x => {
            const matches = /^(.+)\.(.*?)$/.exec(x.name)
            return matches ? matches[1].toLowerCase() : ''
          },
          x => x.name.toLowerCase()
        ],
        ['desc', 'asc', 'asc']
      )

    case '-ext':
      return orderBy(
        files,
        [
          x => x.fileType === 'DIRECTORY',
          x => {
            const matches = /^(.+)\.(.*?)$/.exec(x.name)
            return matches ? matches[1].toLowerCase() : ''
          },
          x => x.name.toLowerCase()
        ],
        ['desc', 'desc', 'desc']
      )

    case 'mtime':
      return orderBy(
        files,
        [
          x => x.fileType === 'DIRECTORY',
          'modificationTime',
          x => x.name.toLowerCase()
        ],
        ['desc', 'desc', 'asc']
      )

    case '-mtime':
      return orderBy(
        files,
        [
          x => x.fileType === 'DIRECTORY',
          'modificationTime',
          x => x.name.toLowerCase()
        ],
        ['desc', 'desc', 'desc']
      )

    default:
      return files
  }
}
