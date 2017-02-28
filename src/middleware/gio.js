const GioAdapter = require('../adapters/Gio').default

exports.default = ({Gio, GLib, Gtk, nextTick}) => {
  let gioAdapter

  return ({ dispatch }) => next => action => {
    if (!gioAdapter) {
      gioAdapter = new GioAdapter({
        GLib: GLib,
        Gio: Gio,
        Gtk: Gtk,
        onResponse: exports.handleResponse({
          dispatch: dispatch,
          nextTick: nextTick
        })
      })
    }

    const isRequest = !!action.requestId &&
      !action.error && !action.progress && !action.ready

    if (isRequest) {
      exports.handleRequest(gioAdapter, action)
    }

    return next(action)
  }
}

exports.handleRequest = (gioAdapter, action) => {
  switch (action.type) {
    case 'DRIVES_REQUESTED':
      gioAdapter._getDrives(action.requestId)
      break

    case 'MOUNT_REQUESTED':
      gioAdapter._mount(action.identifier, action.requestId)
      break

    case 'MOUNT_CANCEL_REQUESTED':
      gioAdapter._cancelMount(action.requestId)
      break

    case 'UNMOUNT_REQUESTED':
      gioAdapter._unmount(action.identifier, action.requestId)
      break

    case 'UNMOUNT_CANCEL_REQUESTED':
      gioAdapter._cancelUnmount(action.requestId)
      break

    case 'LS':
      gioAdapter.ls(action)
      break

    case 'LS_CANCEL':
      gioAdapter.cancelLs(action)
      break

    case 'MKDIR':
      gioAdapter.mkdir(action)
      break

    case 'MKDIR_CANCEL':
      gioAdapter.cancelMkdir(action)
      break

    case 'CP':
    case 'MV':
    case 'RM':
      gioAdapter.work.run(action, gioAdapter.dispatch)
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

exports.handleResponse = ({ dispatch, nextTick }) => (action) => {
  nextTick(() => {
    dispatch(action)
  })
}
