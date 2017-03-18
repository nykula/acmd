exports.CP = 'CP'
exports.cp = (srcPaths, destPath) => {
  if (!srcPaths) {
    return {
      type: exports.CP
    }
  }
  return {
    type: exports.CP,
    requestId: Date.now(),
    srcPaths: srcPaths,
    destPath: destPath
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
exports.ls = (panelId, path) => {
  return {
    type: exports.LS,
    requestId: Date.now(),
    panel: panelId,
    path: path
  }
}
exports.lsError = ({ panel, path, requestId, error }) => {
  return {
    type: exports.LS,
    panel: panel,
    path: path,
    requestId: requestId,
    ready: true,
    error: { message: error.message }
  }
}
exports.lsSuccess = ({ panel, path, requestId, result }) => {
  return {
    type: exports.LS,
    panel: panel,
    path: path,
    requestId: requestId,
    ready: true,
    result: result
  }
}

exports.MKDIR = 'MKDIR'
exports.mkdir = path => {
  return {
    type: exports.MKDIR,
    requestId: Date.now(),
    path: path
  }
}
exports.mkdirError = ({ path, requestId, error }) => {
  return {
    type: exports.MKDIR,
    path: path,
    requestId: requestId,
    ready: true,
    error: error
  }
}
exports.mkdirSuccess = ({ path, requestId, result }) => {
  return {
    type: exports.MKDIR,
    path: path,
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
exports.mv = (srcPaths, destPath) => {
  if (!srcPaths) {
    return {
      type: exports.MV
    }
  }
  return {
    type: exports.MV,
    requestId: Date.now(),
    srcPaths: srcPaths,
    destPath: destPath
  }
}

exports.REFRESH = 'REFRESH'
exports.refresh = () => ({
  type: exports.REFRESH
})

exports.RM = 'RM'
exports.rm = (paths) => {
  if (!paths) {
    return {
      type: exports.RM
    }
  }
  return {
    type: exports.RM,
    requestId: Date.now(),
    paths: paths
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
