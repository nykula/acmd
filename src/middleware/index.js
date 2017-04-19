const actions = require('../actions')
const filesActions = require('../actions/files')
const Fun = require('../utils/Fun').default
const getActiveFiles = require('../selectors/getActiveFiles').default
const getActiveTabId = require('../selectors/getActiveTabId').default
const getCursor = require('../selectors/getCursor').default
const getDest = require('../selectors/getDest').default
const getVisibleFiles = require('../selectors/getVisibleFiles').default
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

    case actions.EXEC:
      exports.handleExec(action)(dispatch, getState, extra)
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

  const file = getVisibleFiles({
    files: state.files.byTabId[action.tabId],
    showHidSys: state.files.showHidSys
  })[action.index]

  const location = state.locations[action.tabId]
  const uri = location.replace(/\/?$/, '') + '/' + file.name

  if (file.fileType !== 'DIRECTORY') {
    exports.handleCtxMenu(action)(dispatch, getState, extra)
    return
  }

  // if (file.name === '..') {
  //   return this.handleLevelUp()
  // }

  dispatch(actions.ls(action.tabId, uri))
}

exports.handleCp = action => (dispatch, getState, { Dialog, gioAdapter }) => {
  const state = getState()

  if (isTrigger(action)) {
    const files = getActiveFiles(state)
    const uris = files.map(x => x.uri)
    const urisStr = files.length === 1 ? uris[0] + ' ' : '\n' + uris.join('\n') + '\n'

    const dest = getDest(state)
    const destUri = dest + '/' + (files.length === 1 ? files[0].name : '')

    Dialog.prompt('Copy ' + urisStr + 'to:', destUri, destUri => {
      if (destUri) {
        dispatch(actions.cp(uris, destUri))
      }
    })
  } else if (isRequest(action)) {
    gioAdapter.work.run(action, dispatch)
  } else if (isResponse(action)) {
    dispatch(actions.refresh())
  }
}

exports.handleCtxMenu = action => (dispatch, getState, { Dialog, gioAdapter, Gtk }) => {
  const file = getCursor(getState())

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

  const file = getCursor(state)
  Dialog.alert('Editing ' + file.uri, noop)
}

exports.handleExec = action => (dispatch, getState, { Dialog, gioAdapter }) => {
  if (action.cmd.indexOf('javascript:') === 0) {
    Fun(action.cmd.slice('javascript:'.length))()
    return
  }

  if (action.cmd.indexOf('redux:') === 0) {
    dispatch(Fun('return ' + action.cmd.slice('redux:'.length))())
    return
  }

  const state = getState()
  const location = state.locations[getActiveTabId(state)]

  if (location.indexOf('file:///') !== 0) {
    Dialog.alert('Operation not supported.', noop)
    return
  }

  gioAdapter.spawn({
    cwd: location.replace(/^file:\/\//, ''),
    argv: gioAdapter.GLib.shell_parse_argv(action.cmd)[1]
  })
}

exports.handleLevelUp = action => (dispatch, getState) => {
  const state = getState()

  const tabId = state.panels.activeTabId[action.panelId]
  const location = state.locations[tabId]
  let nextLocation = location.replace(/\/[^/]+$/, '')

  if (nextLocation === 'file://') {
    nextLocation = 'file:///'
  }

  dispatch(actions.ls(tabId, nextLocation))
}

exports.handleLs = action => (dispatch, getState, { Dialog, gioAdapter }) => {
  const state = getState()

  if (isTrigger(action)) {
    Dialog.prompt('List files at URI: ', '', input => {
      const activeTabId = getActiveTabId(state)

      if (input.indexOf('file:///') === 0) {
        dispatch(actions.ls(activeTabId, input))
        return
      }

      if (input[0] === '/') {
        dispatch(actions.ls(activeTabId, 'file://' + input))
        return
      }

      gioAdapter.mount({
        uri: input,
        onError: error => {
          Dialog.alert(error.message, noop)
        },
        onSuccess: uri => {
          dispatch(actions.ls(activeTabId, uri))
          dispatch(actions.drives(Date.now()))
        }
      })
    })
  } else if (isRequest(action)) {
    const { tabId, uri, requestId } = action

    gioAdapter.ls({
      uri: uri,

      onError: (err) => {
        dispatch(actions.lsError({
          tabId: tabId,
          uri: uri,
          requestId: requestId,
          error: { message: err.message }
        }))
      },

      onSuccess: (files) => {
        dispatch(actions.lsSuccess({
          tabId: tabId,
          uri: uri,
          requestId: requestId,
          result: { files: files }
        }))
      }
    })
  } else if (isError(action)) {
    Dialog.alert(action.error.message, () => {
      if (state.locations[action.tabId] !== 'file:///') {
        dispatch(actions.ls(action.tabId, 'file:///'))
      }
    })
  }
}

exports.handleMkdir = action => (dispatch, getState, { Dialog, gioAdapter }) => {
  if (isTrigger(action)) {
    const state = getState()
    const location = state.locations[getActiveTabId(state)]

    Dialog.prompt('Name of the new dir:', '', name => {
      if (name) {
        dispatch(actions.mkdir(location + '/' + name.replace(/\//g, '_')))
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
    const files = getActiveFiles(state)
    const uris = files.map(x => x.uri)
    const urisStr = files.length === 1 ? uris[0] + ' ' : '\n' + uris.join('\n') + '\n'

    const dest = getDest(state)
    const destUri = dest + '/' + (files.length === 1 ? files[0].name : '')

    Dialog.prompt('Move ' + urisStr + 'to:', destUri, destUri => {
      if (destUri) {
        dispatch(actions.mv(uris, destUri))
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
    const files = getActiveFiles(state)
    const uris = files.map(x => x.uri)
    const urisStr = files.length === 1 ? uris[0] : '\n' + uris.join('\n') + '\n'

    Dialog.confirm('Are you sure you want to remove ' + urisStr + '?', () => {
      dispatch(actions.rm(uris))
    })
  } else if (isRequest(action)) {
    gioAdapter.work.run(action, dispatch)
  } else if (isResponse(action)) {
    dispatch(actions.refresh())
  }
}

exports.handleTerminal = action => (dispatch, getState, { Dialog, gioAdapter }) => {
  const state = getState()
  const location = state.locations[getActiveTabId(state)]

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
  const file = getCursor(state)
  Dialog.alert('Viewing ' + file.uri, noop)
}
