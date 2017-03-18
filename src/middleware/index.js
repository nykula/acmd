const actions = require('../actions')
const filesActions = require('../actions/files')
const getActiveFile = require('../selectors/getActiveFile').default
const isError = action => !!action.error
const isRequest = a => !!a.requestId && !a.error && !a.progress && !a.ready
const isResponse = action => !action.error && !!action.ready
const isTrigger = action => !action.requestId
const noop = require('lodash/noop')

exports.default = extra => ({ dispatch, getState }) => next => action => {
  switch (action.type) {
    case filesActions.ACTIVATED:
      exports.handleActivated(action)(dispatch, getState, extra)
      break

    case actions.CP:
      exports.handleCp(action)(dispatch, getState, extra)
      break

    case actions.DRIVES:
      exports.handleDrives(action)(dispatch, getState, extra)
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

    case actions.MOUNT:
      exports.handleMount(action)(dispatch, getState, extra)
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

    case actions.TERMINAL:
      exports.handleTerminal(action)(dispatch, getState, extra)
      break

    case actions.UNMOUNT:
      exports.handleUnmount(action)(dispatch, getState, extra)
      break

    case actions.VIEW:
      exports.handleView(action)(dispatch, getState, extra)
      break
  }

  return next(action)
}

exports.handleActivated = action => (dispatch, getState, extra) => {
  const state = getState()

  const file = state.files.byPanel[action.panelId][action.index]
  const location = state.locations[action.panelId]
  const uri = location.replace(/\/?$/, '') + '/' + file.name

  if (file.fileType !== 'DIRECTORY') {
    exports.handleCtxMenu(action)(dispatch, getState, extra)
    return
  }

  // if (file.name === '..') {
  //   return this.handleLevelUp()
  // }

  dispatch(actions.ls(action.panelId, uri))
}

exports.handleCp = action => (dispatch, getState, { Dialog, gioAdapter }) => {
  const state = getState()

  if (isTrigger(action)) {
    const file = getActiveFile(state)
    const target = state.locations[state.panels.active === 0 ? 1 : 0]

    const uri = file.uri
    let destUri = target + '/' + file.name

    Dialog.prompt('Copy ' + uri + ' to:', destUri, destUri => {
      if (destUri) {
        dispatch(actions.cp([uri], destUri))
      }
    })
  } else if (isRequest(action)) {
    gioAdapter.work.run(action, dispatch)
  } else if (isResponse(action)) {
    dispatch(actions.refresh())
  }
}

exports.handleCtxMenu = action => (dispatch, getState, { Dialog, gioAdapter, Gtk }) => {
  const file = getActiveFile(getState())

  if (file.handlers.length === 0) {
    Dialog.alert('No handlers registered for ' + file.contentType + '.', noop)
    return
  }

  const menu = new Gtk.Menu()

  file.handlers.forEach(handler => {
    let item

    if (handler.icon) {
      item = new Gtk.MenuItem()

      const box = new Gtk.Box()
      item.add(box)

      const image = Gtk.Image.new_from_icon_name(handler.icon, Gtk.IconSize.MENU)
      box.add(image)

      const label = new Gtk.Label({ label: handler.displayName })
      box.add(label)
    } else {
      item = new Gtk.MenuItem({ label: handler.displayName })
    }

    item.connect('activate', () => {
      gioAdapter.launch(handler, [file.uri])
    })

    menu.add(item)
  })

  menu.show_all()
  menu.popup(null, null, null, null, null)
}

exports.handleDrives = action => (dispatch, getState, { gioAdapter }) => {
  const { requestId } = action

  if (isRequest(action)) {
    gioAdapter.drives({
      onSuccess: result => {
        dispatch(actions.drivesReady({
          requestId: requestId,
          result: result
        }))
      }
    })
  }
}

exports.handleEditor = action => (dispatch, getState, { Dialog }) => {
  const state = getState()

  const file = getActiveFile(state)
  Dialog.alert('Editing ' + file.uri, noop)
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

exports.handleLs = action => (dispatch, getState, { Dialog, gioAdapter }) => {
  const state = getState()

  if (isRequest(action)) {
    const { panel, uri, requestId } = action

    gioAdapter.ls({
      uri: uri,

      onError: (err) => {
        dispatch(actions.lsError({
          panel: panel,
          uri: uri,
          requestId: requestId,
          error: { message: err.message }
        }))
      },

      onSuccess: (files) => {
        dispatch(actions.lsSuccess({
          panel: panel,
          uri: uri,
          requestId: requestId,
          result: { files: files }
        }))
      }
    })
  } else if (isError(action)) {
    Dialog.alert(action.error.message, () => {
      if (state.locations[action.panel] !== 'file:///') {
        dispatch(actions.ls(action.panel, 'file:///'))
      }
    })
  }
}

exports.handleMkdir = action => (dispatch, getState, { Dialog, gioAdapter }) => {
  if (isTrigger(action)) {
    const state = getState()
    const activePanel = state.panels.active
    const location = state.locations[activePanel]

    Dialog.prompt('Name of the new dir:', '', (name) => {
      name = name.replace(/\//g, '_')

      if (name) {
        dispatch(actions.mkdir(location + '/' + name))
      }
    })
  } else if (isRequest(action)) {
    const { uri, requestId } = action

    gioAdapter.mkdir({
      uri: uri,

      onError: (err) => {
        dispatch(actions.mkdirError({
          uri: uri,
          requestId: requestId,
          error: { message: err.message }
        }))
      },

      onSuccess: () => {
        dispatch(actions.mkdirSuccess({
          uri: uri,
          requestId: requestId,
          result: { ok: true }
        }))
      }
    })
  } else if (isResponse(action)) {
    dispatch(actions.refresh())
  }
}

exports.handleMount = action => (dispatch, getState, { gioAdapter }) => {
  if (isRequest(action)) {
    const { identifier, requestId } = action

    gioAdapter.mount({
      identifier: identifier,

      onSuccess: () => {
        dispatch(actions.mountReady(requestId))
      }
    })
  } else if (isResponse(action)) {
    dispatch(actions.refresh())
  }
}

exports.handleMv = action => (dispatch, getState, { Dialog, gioAdapter }) => {
  const state = getState()

  if (isTrigger(action)) {
    const file = getActiveFile(state)
    const target = state.locations[state.panels.active === 0 ? 1 : 0]

    const uri = file.uri
    let destUri = target + '/' + file.name

    Dialog.prompt('Move ' + uri + ' to:', destUri, destUri => {
      if (destUri) {
        dispatch(actions.mv([uri], destUri))
      }
    })
  } else if (isRequest(action)) {
    gioAdapter.work.run(action, dispatch)
  } else if (isResponse(action)) {
    dispatch(actions.refresh())
  }
}

exports.handleRefresh = action => (dispatch, getState) => {
  const state = getState()
  dispatch(actions.ls(0, state.locations[0]))
  dispatch(actions.ls(1, state.locations[1]))
  dispatch(actions.drives(Date.now()))
}

exports.handleRm = action => (dispatch, getState, { Dialog, gioAdapter }) => {
  const state = getState()

  if (isTrigger(action)) {
    const uri = getActiveFile(state).uri

    Dialog.confirm('Are you sure you want to remove ' + uri + '?', (yes) => {
      dispatch(actions.rm([uri]))
    })
  } else if (isRequest(action)) {
    gioAdapter.work.run(action, dispatch)
  } else if (isResponse(action)) {
    dispatch(actions.refresh())
  }
}

exports.handleTerminal = action => (dispatch, getState, { Dialog, gioAdapter }) => {
  const state = getState()
  const location = state.locations[state.panels.active]

  if (location.indexOf('file:///') !== 0) {
    Dialog.alert('Operation not supported.', noop)
    return
  }

  gioAdapter.spawn({
    cwd: location.replace(/^file:\/\//, ''),
    argv: ['x-terminal-emulator']
  })
}

exports.handleUnmount = action => (dispatch, getState, { gioAdapter }) => {
  if (isRequest(action)) {
    const { requestId, uri } = action

    gioAdapter.unmount({
      uri: uri,

      onSuccess: () => {
        dispatch(actions.unmountReady(requestId))
      }
    })
  } else if (isResponse(action)) {
    dispatch(actions.refresh())
  }
}

exports.handleView = action => (dispatch, getState, { Dialog }) => {
  const state = getState()
  const file = getActiveFile(state)
  Dialog.alert('Viewing ' + file.uri, noop)
}
