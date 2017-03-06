const GioAdapter = require('../adapters/Gio').default

exports.default = ({ Gio, GLib, Gtk }) => {
  let gioAdapter

  return ({ dispatch }) => next => action => {
    if (!gioAdapter) {
      gioAdapter = new GioAdapter({
        GLib: GLib,
        Gio: Gio,
        Gtk: Gtk
      })
    }

    const isRequest = !!action.requestId &&
      !action.error && !action.progress && !action.ready

    if (isRequest) {
      exports.handleRequest(gioAdapter, dispatch, action)
    }

    return next(action)
  }
}

exports.handleRequest = (gioAdapter, dispatch, action) => {
  switch (action.type) {
    case 'DRIVES_REQUESTED':
      exports.handleDrives(gioAdapter, dispatch, action)
      break

    case 'MOUNT_REQUESTED':
      exports.handleMount(gioAdapter, dispatch, action)
      break

    case 'UNMOUNT_REQUESTED':
      exports.handleUnmount(gioAdapter, dispatch, action)
      break

    case 'LS':
      exports.handleLs(gioAdapter, dispatch, action)
      break

    case 'MKDIR':
      exports.handleMkdir(gioAdapter, dispatch, action)
      break

    case 'CP':
    case 'MV':
    case 'RM':
      gioAdapter.work.run(action, dispatch)
      break

    case 'CP_PAUSE':
    case 'MV_PAUSE':
    case 'RM_PAUSE':
      gioAdapter.work.stop(action)
      break

    case 'CP_RESUME':
    case 'MV_RESUME':
    case 'RM_RESUME':
      gioAdapter.work.continue(action)
      break

    case 'CP_CANCEL':
    case 'MV_CANCEL':
    case 'RM_CANCEL':
      gioAdapter.work.interrupt(action)
      break

    default:
      break
  }
}

exports.handleDrives = (gioAdapter, dispatch, action) => {
  const { requestId } = action

  gioAdapter.drives({
    onSuccess: (drives) => {
      dispatch({
        type: 'DRIVES_REQUESTED',
        requestId: requestId,
        ready: true,
        result: { drives: drives }
      })
    }
  })
}

exports.handleLs = (gioAdapter, dispatch, props) => {
  const { panel, path, requestId } = props

  gioAdapter.ls({
    path: path,

    onError: (err) => {
      dispatch({
        type: 'LS',
        panel: panel,
        path: path,
        requestId: requestId,
        ready: true,
        error: { message: err.message }
      })
    },

    onSuccess: (files) => {
      dispatch({
        type: 'LS',
        panel: panel,
        path: path,
        requestId: requestId,
        ready: true,
        result: { files: files }
      })
    }
  })
}

exports.handleMkdir = (gioAdapter, dispatch, action) => {
  const { path, requestId } = action

  gioAdapter.mkdir({
    path: path,

    onError: (err) => {
      dispatch({
        type: 'MKDIR',
        path: path,
        requestId: requestId,
        ready: true,
        error: { message: err.message }
      })
    },

    onSuccess: () => {
      dispatch({
        type: 'MKDIR',
        path: path,
        requestId: requestId,
        ready: true,
        result: { ok: true }
      })
    }
  })
}

exports.handleMount = (gioAdapter, dispatch, action) => {
  const { identifier, requestId } = action

  gioAdapter.mount({
    identifier: identifier,

    onSuccess: () => {
      dispatch({
        type: 'MOUNT_REQUESTED',
        requestId: requestId,
        ready: true
      })
    }
  })
}

exports.handleUnmount = (gioAdapter, dispatch, action) => {
  const { identifier, requestId } = action

  gioAdapter.unmount({
    identifier: identifier,

    onSuccess: () => {
      dispatch({
        type: 'UNMOUNT_REQUESTED',
        requestId: requestId,
        ready: true
      })
    }
  })
}
