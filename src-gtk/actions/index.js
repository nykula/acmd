exports.CP = 'CP'
exports.cp = (srcPaths, destPath) => {
  if (!srcPaths) {
    return { type: exports.CP }
  }
  return {
    type: exports.CP,
    requestId: Date.now(),
    srcPaths: srcPaths,
    destPath: destPath
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
exports.levelUp = ({panelId}) => {
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

exports.MKDIR = 'MKDIR'
exports.mkdir = (path) => {
  return {
    type: exports.MKDIR,
    requestId: Date.now(),
    path: path
  }
}

exports.MV = 'MV'
exports.mv = (srcPaths, destPath) => {
  if (!srcPaths) {
    return { type: exports.MV }
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
    return { type: exports.RM }
  }
  return {
    type: 'RM',
    requestId: Date.now(),
    paths: paths
  }
}

exports.VIEW = 'VIEW'
exports.view = () => ({
  type: exports.VIEW
})
