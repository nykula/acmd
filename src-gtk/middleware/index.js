const actions = require('../actions')
const filesActions = require('../actions/files')
const isResponse = action => !action.error && action.ready
const noop = require('lodash/noop')
const selectors = require('../selectors')

exports.default = extra => ({ dispatch, getState }) => next => action => {
  switch (action.type) {
    case filesActions.ACTIVATED:
      exports.handleActivated(action)(dispatch, getState, extra)
      break

    case actions.CP:
      exports.handleCp(action)(dispatch, getState, extra)
      break

    case actions.EDITOR:
      exports.handleEditor(action)(dispatch, getState, extra)
      break

    case actions.LEVEL_UP:
      exports.handleLevelUp(action)(dispatch, getState, extra)
      break

    case actions.LS:
      exports.handleLs(action)(dispatch, getState, extra)
      break

    case actions.MKDIR:
      exports.handleMkdir(action)(dispatch, getState, extra)
      break

    case actions.MV:
      exports.handleMv(action)(dispatch, getState, extra)
      break

    case actions.REFRESH:
      exports.handleRefresh(action)(dispatch, getState, extra)
      break

    case actions.RM:
      exports.handleRm(action)(dispatch, getState, extra)
      break

    case actions.VIEW:
      exports.handleView(action)(dispatch, getState, extra)
      break
  }

  return next(action)
}

exports.handleActivated = action => (dispatch, getState) => {
  const state = getState()

  const file = state.files.byPanel[action.panelId][action.index]
  const location = state.locations[action.panelId]
  const path = location.replace(/\/?$/, '') + '/' + file.name

  // if (file.fileType !== 'DIRECTORY') {
  //   return this.handleView()
  // }

  // if (file.name === '..') {
  //   return this.handleLevelUp()
  // }

  dispatch(actions.ls(action.panelId, path))
}

exports.handleCp = action => (dispatch, getState, { Dialog }) => {
  const state = getState()

  if (!action.requestId) {
    const file = selectors.getActiveFile(state)
    const target = state.locations[state.panels.active === 0 ? 1 : 0]

    const path = file.path
    let targetPath = target + '/' + file.name

    Dialog.prompt('Copy ' + path + ' to:', targetPath, (targetPath) => {
      if (targetPath) {
        dispatch(actions.cp([path], targetPath))
      }
    })
  } else if (isResponse(action)) {
    dispatch(actions.refresh())
  }
}

exports.handleEditor = action => (dispatch, getState, { Dialog }) => {
  const state = getState()

  const file = selectors.getActiveFile(state)
  Dialog.alert('Editing ' + file.path, noop)
}

exports.handleLevelUp = action => (dispatch, getState) => {
  const state = getState()

  const panelId = action.panelId
  const location = state.locations[panelId]
  let nextLocation = location.replace(/\/[^/]+$/, '')

  if (nextLocation === '') {
    nextLocation = '/'
  }

  dispatch(actions.ls(panelId, nextLocation))
}

exports.handleLs = action => (dispatch, getState, { Dialog }) => {
  const state = getState()

  if (action.error) {
    Dialog.alert(action.error.message, () => {
      if (state.locations[action.panel] !== '/') {
        dispatch(actions.ls(action.panel, '/'))
      }
    })
  }
}

exports.handleMkdir = action => (dispatch, getState, { Dialog }) => {
  if (!action.requestId) {
    const state = getState()
    const activePanel = state.panels.active
    const location = state.locations[activePanel]

    Dialog.prompt('Name of the new dir:', '', (name) => {
      name = name.replace(/\//g, '_')

      if (name) {
        Dialog.alert('Creating dir: ' + location + '/' + name)
      }
    })
  } else if (isResponse(action)) {
    dispatch(actions.refresh())
  }
}

exports.handleMv = action => (dispatch, getState, { Dialog }) => {
  const state = getState()

  if (!action.requestId) {
    const file = selectors.getActiveFile(state)
    const target = state.locations[state.panels.active === 0 ? 1 : 0]

    const path = file.path
    let targetPath = target + '/' + file.name

    Dialog.prompt('Move ' + path + ' to:', targetPath, (targetPath) => {
      if (targetPath) {
        dispatch(actions.mv([path], targetPath))
      }
    })
  } else if (isResponse(action)) {
    dispatch(actions.refresh())
  }
}

exports.handleRefresh = action => (dispatch, getState) => {
  const state = getState()
  dispatch(actions.ls(0, state.locations[0]))
  dispatch(actions.ls(1, state.locations[1]))
}

exports.handleRm = action => (dispatch, getState, { Dialog }) => {
  const state = getState()

  if (!action.requestId) {
    const path = selectors.getActiveFile(state).path

    Dialog.confirm('Are you sure you want to remove ' + path + '?', (yes) => {
      dispatch(actions.rm([path]))
    })
  } else if (isResponse(action)) {
    dispatch(actions.refresh())
  }
}

exports.handleView = action => (dispatch, getState, { Dialog }) => {
  const state = getState()
  const file = selectors.getActiveFile(state)
  Dialog.alert('Viewing ' + file.path, noop)
}
