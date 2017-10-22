const Action = require('../Action/Action')
const FileAction = require('../File/FileAction')
const Fun = require('../Gjs/Fun').default
const getActiveFiles = require('./getActiveFiles').default
const getActiveMountUri = require('../Mount/getActiveMountUri').default
const getActiveTabId = require('../Tab/getActiveTabId').default
const getCursor = require('../Action/getCursor').default
const getDest = require('../Action/getDest').default
const getHistoryItem = require('../Action/getHistoryItem').default
const getVisibleFiles = require('../Action/getVisibleFiles').default
const noop = require('lodash/noop')

/**
 * @param {*} action
 */
const isError = action => !!action.error

/**
 * @param {*} a
 */
const isRequest = a => !!a.requestId && !a.error && !a.progress && !a.ready

/**
 * @param {*} action
 */
const isResponse = action => !action.error && !!action.ready

/**
 * @param {*} action
 */
const isTrigger = action => !action.requestId

exports.default = extra => ({ dispatch, getState }) => next => action => {
  switch (action.type) {
    case FileAction.ACTIVATED:
      exports.handleActivated(action)(dispatch, getState, extra)
      break

    case Action.BACK:
      exports.handleBack(action)(dispatch, getState, extra)
      break

    case Action.CP:
      exports.handleCp(action)(dispatch, getState, extra)
      break

    case Action.DRIVES:
      exports.handleDrives(action)(dispatch, getState, extra)
      break

    case Action.EDITOR:
      exports.handleEditor(action)(dispatch, getState, extra)
      break

    case Action.EXEC:
      exports.handleExec(action)(dispatch, getState, extra)
      break

    case Action.FORWARD:
      exports.handleForward(action)(dispatch, getState, extra)
      break

    case Action.LEVEL_UP:
      exports.handleLevelUp(action)(dispatch, getState, extra)
      break

    case Action.LS:
      exports.handleLs(action)(dispatch, getState, extra)
      break

    case Action.MKDIR:
      exports.handleMkdir(action)(dispatch, getState, extra)
      break

    case Action.MOUNT:
      exports.handleMount(action)(dispatch, getState, extra)
      break

    case Action.MOUNTS:
      exports.handleMounts(action)(dispatch, getState, extra)
      break

    case Action.MV:
      exports.handleMv(action)(dispatch, getState, extra)
      break

    case Action.REFRESH:
      exports.handleRefresh(action)(dispatch, getState, extra)
      break

    case Action.RM:
      exports.handleRm(action)(dispatch, getState, extra)
      break

    case Action.ROOT:
      exports.handleRoot(action)(dispatch, getState, extra)
      break

    case Action.TERMINAL:
      exports.handleTerminal(action)(dispatch, getState, extra)
      break

    case Action.TOUCH:
      exports.handleTouch(action)(dispatch, getState, extra)
      break

    case Action.UNMOUNT:
      exports.handleUnmount(action)(dispatch, getState, extra)
      break

    case Action.VIEW:
      exports.handleView(action)(dispatch, getState, extra)
      break
  }

  return next(action)
}

exports.handleActivated = action => (dispatch, getState, extra) => {
  const state = getState()

  const file = getVisibleFiles({
    files: state.tabs[action.tabId].files,
    showHidSys: state.showHidSys
  })[action.index]

  const location = state.tabs[action.tabId].location
  const uri = location.replace(/\/?$/, '') + '/' + file.name

  if (file.fileType !== 'DIRECTORY') {
    exports.handleCtxMenu(action)(dispatch, getState, extra)
    return
  }

  if (file.name === '..') {
    exports.handleLevelUp(action)(dispatch, getState, extra)
    return
  }

  dispatch(Action.ls(action.tabId, uri))
}

exports.handleBack = _ => (dispatch, getState) => {
  const state = getState()
  const tabId = getActiveTabId(state)
  const uri = getHistoryItem(state, tabId, -1)

  if (uri) {
    dispatch(Action.ls(tabId, uri, -1))
  }
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
        dispatch(Action.cp(uris, destUri))
      }
    })
  } else if (isRequest(action)) {
    gioAdapter.work.run(action, dispatch)
  } else if (isResponse(action)) {
    dispatch(Action.refresh())
  }
}

exports.handleCtxMenu = _ => (_dispatch, getState, { Dialog, gioAdapter, Gtk }) => {
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

exports.handleDrives = action => (dispatch, _getState, { gioAdapter }) => {
  const { requestId } = action

  if (isRequest(action)) {
    gioAdapter.drives((_, result) => {
      dispatch(Action.drivesReady({
        requestId: requestId,
        result: result
      }))
    })
  }
}

exports.handleEditor = _ => (_dispatch, getState, { Dialog }) => {
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
  const location = state.tabs[getActiveTabId(state)].location

  if (location.indexOf('file:///') !== 0) {
    Dialog.alert('Operation not supported.', noop)
    return
  }

  gioAdapter.spawn({
    cwd: location.replace(/^file:\/\//, ''),
    argv: gioAdapter.GLib.shell_parse_argv(action.cmd)[1]
  })
}

exports.handleForward = _action => (dispatch, getState) => {
  const state = getState()
  const tabId = getActiveTabId(state)
  const uri = getHistoryItem(state, tabId, 1)

  if (uri) {
    dispatch(Action.ls(tabId, uri, 1))
  }
}

exports.handleLevelUp = action => (dispatch, getState) => {
  const state = getState()

  const tabId = state.panels[action.panelId].activeTabId
  const location = state.tabs[tabId].location
  let nextLocation = location.replace(/\/[^/]+$/, '')

  if (nextLocation === 'file://') {
    nextLocation = 'file:///'
  }

  dispatch(Action.ls(tabId, nextLocation))
}

exports.handleLs = action => (dispatch, getState, { Dialog, gioAdapter }) => {
  const state = getState()

  if (isTrigger(action)) {
    Dialog.prompt('List files at URI: ', '', input => {
      const activeTabId = getActiveTabId(state)

      if (input.indexOf('file:///') === 0) {
        dispatch(Action.ls(activeTabId, input))
        return
      }

      if (input[0] === '/') {
        dispatch(Action.ls(activeTabId, 'file://' + input))
        return
      }

      gioAdapter.mount({ uri: input }, (error, uri) => {
        if (error) {
          Dialog.alert(error.message, noop)
        } else {
          dispatch(Action.ls(activeTabId, uri))
          dispatch(Action.drives(Date.now()))
        }
      })
    })
  } else if (isRequest(action)) {
    const { tabId, uri, requestId, delta } = action

    gioAdapter.ls(uri, (error, files) => {
      if (error) {
        dispatch(Action.lsError({
          tabId: tabId,
          uri: uri,
          requestId: requestId,
          error: { message: error.message },
          delta: delta
        }))
      } else {
        dispatch(Action.lsSuccess({
          tabId: tabId,
          uri: uri,
          requestId: requestId,
          result: { files: files },
          delta: delta
        }))
      }
    })
  } else if (isError(action)) {
    Dialog.alert(action.error.message, () => {
      if (state.tabs[action.tabId].location !== 'file:///') {
        dispatch(Action.ls(action.tabId, 'file:///'))
      }
    })
  }
}

exports.handleMkdir = action => (dispatch, getState, { Dialog, gioAdapter }) => {
  if (isTrigger(action)) {
    const state = getState()
    const location = state.tabs[getActiveTabId(state)].location

    Dialog.prompt('Name of the new dir:', '', name => {
      if (name) {
        dispatch(Action.mkdir(location + '/' + name.replace(/\//g, '_')))
      }
    })
  } else if (isRequest(action)) {
    const { uri, requestId } = action

    gioAdapter.mkdir(uri, error => {
      if (error) {
        dispatch(Action.mkdirError({
          uri: uri,
          requestId: requestId,
          error: { message: error.message }
        }))
      } else {
        dispatch(Action.mkdirSuccess({
          uri: uri,
          requestId: requestId,
          result: { ok: true }
        }))
      }
    })
  } else if (isResponse(action)) {
    dispatch(Action.refresh())
  }
}

exports.handleMount = action => (dispatch, _, { gioAdapter }) => {
  if (isRequest(action)) {
    const { identifier, requestId } = action

    gioAdapter.mount({ identifier: identifier }, () => {
      dispatch(Action.mountReady(requestId))
    })
  } else if (isResponse(action)) {
    dispatch(Action.refresh())
  }
}

exports.handleMounts = action => (_, _getState, { refstore }) => {
  refstore.get('mounts' + action.panelId).popup()
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
        dispatch(Action.mv(uris, destUri))
      }
    })
  } else if (isRequest(action)) {
    gioAdapter.work.run(action, dispatch)
  } else if (isResponse(action)) {
    dispatch(Action.refresh())
  }
}

exports.handleRefresh = _ => (dispatch, getState) => {
  const state = getState()
  const panel0TabId = state.panels[0].activeTabId
  const panel1TabId = state.panels[1].activeTabId
  dispatch(Action.ls(panel0TabId, state.tabs[panel0TabId].location))
  dispatch(Action.ls(panel1TabId, state.tabs[panel1TabId].location))
  dispatch(Action.drives(Date.now()))
}

exports.handleRm = action => (dispatch, getState, { Dialog, gioAdapter }) => {
  const state = getState()

  if (isTrigger(action)) {
    const files = getActiveFiles(state)
    const uris = files.map(x => x.uri)
    const urisStr = files.length === 1 ? uris[0] : '\n' + uris.join('\n') + '\n'

    Dialog.confirm('Are you sure you want to remove ' + urisStr + '?', () => {
      dispatch(Action.rm(uris))
    })
  } else if (isRequest(action)) {
    gioAdapter.work.run(action, dispatch)
  } else if (isResponse(action)) {
    dispatch(Action.refresh())
  }
}

exports.handleRoot = action => (dispatch, getState) => {
  const state = getState()
  const tabId = state.panels[action.panelId].activeTabId
  const nextLocation = getActiveMountUri(state, action.panelId)
  dispatch(Action.ls(tabId, nextLocation))
}

exports.handleTerminal = _ => (_dispatch, getState, { Dialog, gioAdapter }) => {
  const state = getState()
  const location = state.tabs[getActiveTabId(state)].location

  if (location.indexOf('file:///') !== 0) {
    Dialog.alert('Operation not supported.', noop)
    return
  }

  gioAdapter.spawn({
    cwd: location.replace(/^file:\/\//, ''),
    argv: ['x-terminal-emulator']
  })
}

exports.handleTouch = action => (dispatch, getState, { Dialog, gioAdapter }) => {
  if (isTrigger(action)) {
    const state = getState()
    const location = state.tabs[getActiveTabId(state)].location

    Dialog.prompt('Name of the new file:', '', name => {
      if (name) {
        dispatch(Action.touch(location + '/' + name.replace(/\//g, '_')))
      }
    })
  } else if (isRequest(action)) {
    const { uri, requestId } = action

    gioAdapter.touch(uri, error => {
      if (error) {
        dispatch(Action.touchError({
          uri: uri,
          requestId: requestId,
          error: { message: error.message }
        }))
      } else {
        dispatch(Action.touchSuccess({
          uri: uri,
          requestId: requestId,
          result: { ok: true }
        }))
      }
    })
  } else if (isResponse(action)) {
    dispatch(Action.refresh())
  } else if (isError(action)) {
    Dialog.alert(action.error.message, noop)
  }
}

exports.handleUnmount = action => (dispatch, _, { gioAdapter }) => {
  if (isRequest(action)) {
    const { requestId, uri } = action

    gioAdapter.unmount(uri, () => {
      dispatch(Action.unmountReady(requestId))
    })
  } else if (isResponse(action)) {
    dispatch(Action.refresh())
  }
}

exports.handleView = _ => (_dispatch, getState, { Dialog }) => {
  const state = getState()
  const file = getCursor(state)
  Dialog.alert('Viewing ' + file.uri, noop)
}
