exports.BACK = 'BACK'

exports.CP = 'CP'
/**
 * @param {string[] | undefined} srcUris
 * @param {string | undefined} destUri
 */
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
/**
 * @param {number} requestId
 */
exports.drives = requestId => {
  return {
    type: exports.DRIVES,
    requestId: requestId
  }
}
/**
 * @param {{ requestId: number, result: * }} props
 */
exports.drivesReady = (props) => {
  return {
    type: exports.DRIVES,
    requestId: props.requestId,
    ready: true,
    result: props.result
  }
}

exports.EXEC = 'EXEC'
/**
 * @param {string} cmd
 */
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
/**
 * @param {{ panelId: string }} props
 */
exports.levelUp = (props) => {
  return {
    type: exports.LEVEL_UP,
    panelId: props.panelId
  }
}

exports.LS = 'LS'
/**
 * @param {string} tabId
 * @param {string} uri
 * @param {number=} delta
 */
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
/**
 * @param {{ tabId: string, uri: string, requestId: number, error: *, delta: number | undefined }} props
 */
exports.lsError = (props) => {
  const { tabId, uri, requestId, error, delta } = props
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
/**
 * @param {{ tabId: string, uri: string, requestId: number, result: *, delta: number | undefined }} props
 */
exports.lsSuccess = (props) => {
  const { tabId, uri, requestId, result, delta } = props
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
/**
 * @param {string} uri
 */
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
/**
 * @param {{ uri: string, requestId: number, error: * }} props
 */
exports.mkdirError = (props) => {
  const { uri, requestId, error } = props
  return {
    type: exports.MKDIR,
    uri: uri,
    requestId: requestId,
    ready: true,
    error: error
  }
}
/**
 * @param {{ uri: string, requestId: number, result: * }} props
 */
exports.mkdirSuccess = (props) => {
  const { uri, requestId, result } = props
  return {
    type: exports.MKDIR,
    uri: uri,
    requestId: requestId,
    ready: true,
    result: result
  }
}

exports.MOUNT = 'MOUNT'
/**
 * @param {string} uuid
 */
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
/**
 * @param {number} requestId
 */
exports.mountReady = requestId => {
  return {
    type: exports.MOUNT,
    requestId: requestId,
    ready: true
  }
}

exports.MOUNTS = 'MOUNTS'
/**
 * @param {string} panelId
 */
exports.mounts = panelId => {
  return {
    type: exports.MOUNTS,
    panelId: panelId
  }
}

exports.MV = 'MV'
/**
 * @param {string[]} srcUris
 * @param {string} destUri
 */
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
/**
 * @param {string[]} uris
 */
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
/**
 * @param {{ panelId: string }} props
 */
exports.root = (props) => {
  return {
    type: exports.ROOT,
    panelId: props.panelId
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
/**
 * @param {string} uri
 */
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
/**
 * @param {{ uri: string, requestId: number, error: * }} props
 */
exports.touchError = (props) => {
  const { uri, requestId, error } = props
  return {
    type: exports.TOUCH,
    uri: uri,
    requestId: requestId,
    ready: true,
    error: error
  }
}
/**
 * @param {{ uri: string, requestId: number, result: * }} props
 */
exports.touchSuccess = (props) => {
  const { uri, requestId, result } = props
  return {
    type: exports.TOUCH,
    uri: uri,
    requestId: requestId,
    ready: true,
    result: result
  }
}

exports.UNMOUNT = 'UNMOUNT'
/**
 * @param {string} uri
 */
exports.unmount = uri => {
  return {
    type: exports.UNMOUNT,
    requestId: Date.now(),
    uri: uri
  }
}
/**
 * @param {number} requestId
 */
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
