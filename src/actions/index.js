export const prevFile = () => {
  return {
    type: 'prevFile'
  }
}

export const nextFile = () => {
  return {
    type: 'nextFile'
  }
}

export const ls = (panel, path) => {
  return {
    type: 'LS',
    requestId: Date.now(),
    panel: panel,
    path: path
  }
}

export const cp = (srcPath, destPath) => {
  return {
    type: 'CP',
    requestId: Date.now(),
    srcPaths: [ srcPath ],
    destPath: destPath
  }
}

export const mv = (srcPath, destPath) => {
  return {
    type: 'MV',
    requestId: Date.now(),
    srcPaths: [ srcPath ],
    destPath: destPath
  }
}

export const rm = (path) => {
  return {
    type: 'RM',
    requestId: Date.now(),
    paths: [ path ]
  }
}
