const actions = require('../../actions')
const assign = require('lodash/assign')
const filesActions = require('../../actions/files')
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
  0: {
    cursor: 0,
    files: sampleFiles,
    selected: [],
    sortedBy: 'ext'
  },
  1: {
    cursor: 0,
    files: sampleFiles,
    selected: [],
    sortedBy: 'ext'
  }
}

exports.default = (state, payload) => {
  state = state || initialState
  let by
  let files

  switch (payload.type) {
    case filesActions.CURSOR: {
      state = assign({}, state)

      state[payload.tabId] = assign({}, state[payload.tabId], {
        cursor: payload.cursor
      })

      return state
    }

    case filesActions.SELECTED: {
      state = assign({}, state)

      state[payload.tabId] = assign({}, state[payload.tabId], {
        selected: payload.selected
      })

      return state
    }

    case filesActions.SORTED: {
      by = nextSort(state[payload.tabId].sortedBy, payload.by)
      files = sortFiles(by, state[payload.tabId].files)

      return setTab(state, payload.tabId, {
        sortedBy: by,
        files: files
      })
    }

    case actions.LS: {
      if (payload.result) {
        by = state[payload.tabId].sortedBy
        files = sortFiles(by, payload.result.files)

        return setTab(state, payload.tabId, {
          files: files
        })
      } else {
        return state
      }
    }

    default:
      return state
  }
}

exports.nextSort = nextSort
function nextSort(prevBy, by) {
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

exports.sortFiles = sortFiles
function sortFiles(by, files) {
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
            return matches ? matches[2].toLowerCase() : ''
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
            return matches ? matches[2].toLowerCase() : ''
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
        ['desc', 'asc', 'asc']
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

exports.setTab = setTab
function setTab(state, tabId, data) {
  state = assign({}, state)
  state[tabId] = assign({}, state[tabId], data)

  return state
}