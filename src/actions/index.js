exports.BACK = 'BACK'

exports.CP = 'CP'
exports.cp = (srcUris, destUri) => {
  if (!srcUris) {
    return {
      type: exports.CP
    }
  }
  return {
    type: exports.CP,
    requestId: Date.now(),
    srcUris: srcUris,
    destUri: destUri
  }
}

exports.DRIVES = 'DRIVES'
exports.drives = requestId => {
  return {
    type: exports.DRIVES,
    requestId: requestId
  }
}
exports.drivesReady = ({ requestId, result }) => {
  return {
    type: exports.DRIVES,
    requestId: requestId,
    ready: true,
    result: result
  }
}

exports.EXEC = 'EXEC'
exports.exec = cmd => ({
  type: exports.EXEC,
  cmd: cmd
})

exports.EDITOR = 'EDITOR'
exports.editor = () => ({
  type: exports.EDITOR
})

exports.EXIT = 'EXIT'
exports.exit = () => ({
  type: exports.EXIT
})

exports.FORWARD = 'FORWARD'

exports.LEVEL_UP = 'LEVEL_UP'
exports.levelUp = ({ panelId }) => {
  return {
    type: exports.LEVEL_UP,
    panelId: panelId
  }
}

exports.LS = 'LS'
exports.ls = (tabId, uri, delta) => {
  if (typeof tabId === 'undefined') {
    return {
      type: exports.LS
    }
  }
  return {
    type: exports.LS,
    requestId: Date.now(),
    tabId: tabId,
    uri: uri,
    delta: delta || 0
  }
}
exports.lsError = ({ tabId, uri, requestId, error, delta }) => {
  return {
    type: exports.LS,
    tabId: tabId,
    uri: uri,
    requestId: requestId,
    ready: true,
    error: { message: error.message },
    delta: delta
  }
}
exports.lsSuccess = ({ tabId, uri, requestId, result, delta }) => {
  return {
    type: exports.LS,
    tabId: tabId,
    uri: uri,
    requestId: requestId,
    ready: true,
    result: result,
    delta: delta
  }
}

exports.MKDIR = 'MKDIR'
exports.mkdir = uri => {
  if (!uri) {
    return {
      type: exports.MKDIR
    }
  }
  return {
    type: exports.MKDIR,
    requestId: Date.now(),
    uri: uri
  }
}
exports.mkdirError = ({ uri, requestId, error }) => {
  return {
    type: exports.MKDIR,
    uri: uri,
    requestId: requestId,
    ready: true,
    error: error
  }
}
exports.mkdirSuccess = ({ uri, requestId, result }) => {
  return {
    type: exports.MKDIR,
    uri: uri,
    requestId: requestId,
    ready: true,
    result: result
  }
}

exports.MOUNT = 'MOUNT'
exports.mount = uuid => {
  return {
    type: exports.MOUNT,
    requestId: Date.now(),
    identifier: {
      type: 'uuid',
      value: uuid
    }
  }
}
exports.mountReady = requestId => {
  return {
    type: exports.MOUNT,
    requestId: requestId,
    ready: true
  }
}

exports.MV = 'MV'
exports.mv = (srcUris, destUri) => {
  if (!srcUris) {
    return {
      type: exports.MV
    }
  }
  return {
    type: exports.MV,
    requestId: Date.now(),
    srcUris: srcUris,
    destUri: destUri
  }
}

exports.REFRESH = 'REFRESH'
exports.refresh = () => ({
  type: exports.REFRESH
})

exports.RM = 'RM'
exports.rm = uris => {
  if (!uris) {
    return {
      type: exports.RM
    }
  }
  return {
    type: exports.RM,
    requestId: Date.now(),
    uris: uris
  }
}

exports.ROOT = 'ROOT'
exports.root = ({ panelId }) => {
  return {
    type: exports.ROOT,
    panelId: panelId
  }
}

exports.SHOW_HID_SYS = 'SHOW_HID_SYS'
exports.showHidSys = () => {
  return {
    type: exports.SHOW_HID_SYS
  }
}

exports.TERMINAL = 'TERMINAL'

exports.TOUCH = 'TOUCH'
exports.touch = uri => {
  if (!uri) {
    return {
      type: exports.TOUCH
    }
  }
  return {
    type: exports.TOUCH,
    requestId: Date.now(),
    uri: uri
  }
}
exports.touchError = ({ uri, requestId, error }) => {
  return {
    type: exports.TOUCH,
    uri: uri,
    requestId: requestId,
    ready: true,
    error: error
  }
}
exports.touchSuccess = ({ uri, requestId, result }) => {
  return {
    type: exports.TOUCH,
    uri: uri,
    requestId: requestId,
    ready: true,
    result: result
  }
}

exports.UNMOUNT = 'UNMOUNT'
exports.unmount = uri => {
  return {
    type: exports.UNMOUNT,
    requestId: Date.now(),
    uri: uri
  }
}
exports.unmountReady = requestId => {
  return {
    type: exports.UNMOUNT,
    ready: true,
    requestId: requestId
  }
}

exports.VIEW = 'VIEW'
exports.view = () => ({
  type: exports.VIEW
})
