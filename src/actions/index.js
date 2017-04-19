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

exports.LEVEL_UP = 'LEVEL_UP'
exports.levelUp = ({ panelId }) => {
  return {
    type: exports.LEVEL_UP,
    panelId: panelId
  }
}

exports.LS = 'LS'
exports.ls = (tabId, uri) => {
  return {
    type: exports.LS,
    requestId: Date.now(),
    tabId: tabId,
    uri: uri
  }
}
exports.lsError = ({ tabId, uri, requestId, error }) => {
  return {
    type: exports.LS,
    tabId: tabId,
    uri: uri,
    requestId: requestId,
    ready: true,
    error: { message: error.message }
  }
}
exports.lsSuccess = ({ tabId, uri, requestId, result }) => {
  return {
    type: exports.LS,
    tabId: tabId,
    uri: uri,
    requestId: requestId,
    ready: true,
    result: result
  }
}

exports.MKDIR = 'MKDIR'
exports.mkdir = uri => {
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

exports.SHOW_HID_SYS = 'SHOW_HID_SYS'

exports.TERMINAL = 'TERMINAL'

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
