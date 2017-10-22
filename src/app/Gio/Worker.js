/* global imports */
const Gio = imports.gi.Gio

/**
 * Tasks intended to run in a separate process because they are heavy on IO or
 * GObject Introspection doesn't provide respective asynchronous methods.
 */
function Worker () {
  this.cp = this.cp.bind(this)
  this.mv = this.mv.bind(this)
  this.rm = this.rm.bind(this)

  this.children = this.children.bind(this)
  this.cpDirNode = this.cpDirNode.bind(this)
  this.flatten = this.flatten.bind(this)
  this.prepare = this.prepare.bind(this)
  this.run = this.run.bind(this)
}

/**
 * Performs the requested action. Dispatches the results.
 */
Worker.prototype.run = function (action, dispatch) {
  switch (action.type) {
    case 'CP':
      this.cp(action, dispatch)
      break

    case 'MV':
      this.mv(action, dispatch)
      break

    case 'RM':
      this.rm(action, dispatch)
      break
  }
}

/**
 * Copies sources to a destination directory. Recurses if a source is a
 * directory. Splices the first URI component relative to the source if the
 * source URI ends with a slash, or if there is only one source URI and the
 * destination isn't an existing directory. Dispatches progress reports.
 */
Worker.prototype.cp = function (action, dispatch) {
  const destUri = action.destUri
  const srcUris = action.srcUris

  try {
    const data = this.prepare(destUri, srcUris)

    data.files.forEach(file => {
      if (file.gFileInfo.get_file_type() === Gio.FileType.DIRECTORY) {
        this.cpDirNode(file)
        return
      }

      const fileUri = file.gFile.get_uri()
      const fileDestUri = file.dest.get_uri()

      file.gFile.copy(
        file.dest,
        Gio.FileCopyFlags.OVERWRITE + Gio.FileCopyFlags.NOFOLLOW_SYMLINKS + Gio.FileCopyFlags.ALL_METADATA,
        null,
        (doneSize, size) => {
          dispatch({
            type: 'CP',
            requestId: action.requestId,
            progress: {
              src: fileUri,
              dest: fileDestUri,
              doneSize: doneSize,
              size: size,
              totalDoneSize: data.totalDoneSize + doneSize,
              totalSize: data.totalSize
            }
          })
        }
      )

      data.totalDoneSize += file.gFileInfo.get_size()
    })

    dispatch({
      type: 'CP',
      requestId: action.requestId,
      ready: true
    })
  } catch (err) {
    dispatch({
      type: 'CP',
      requestId: action.requestId,
      ready: true,
      error: { message: err.message }
    })
  }
}

/**
 * Moves sources to a destination directory. Uses cp followed by rm.
 */
Worker.prototype.mv = function (action, dispatch) {
  const requestId = action.requestId
  const destUri = action.destUri
  const srcUris = action.srcUris
  let failed = false

  const handleError = (error) => {
    dispatch({
      type: 'MV',
      requestId: requestId,
      ready: true,
      error: { message: error.message }
    })
  }

  this.cp({
    destUri: destUri,
    srcUris: srcUris
  }, (_action) => {
    if (_action.error) {
      failed = true
      handleError(_action.error)
      return
    }

    if (_action.progress) {
      dispatch({
        type: 'MV',
        requestId: requestId,
        cp: true,
        progress: _action.progress
      })
    }
  })

  this.rm({ uris: srcUris }, (_action) => {
    if (_action.error) {
      failed = true
      handleError(_action.error)
      return
    }

    if (_action.progress) {
      dispatch({
        type: 'MV',
        requestId: requestId,
        rm: true,
        progress: _action.progress
      })
    }
  })

  if (failed) {
    return
  }

  dispatch({
    type: 'MV',
    requestId: requestId,
    ready: true
  })
}

/**
 * Deletes files. Recurses into directories. Dispatches progress reports.
 */
Worker.prototype.rm = function (action, dispatch) {
  const uris = action.uris

  try {
    const gFiles = uris.map(x => Gio.file_new_for_uri(x))

    const files = gFiles.reduce((prev, gFile) => {
      return prev.concat(this.flatten(gFile).files)
    }, [])

    files.reverse()

    const data = {
      files: files,
      totalDone: 0
    }

    data.files.forEach(file => {
      const fileUri = file.gFile.get_uri()
      file.gFile.delete(null)
      data.totalDone++

      dispatch({
        type: 'RM',
        requestId: action.requestId,
        progress: {
          uri: fileUri,
          totalDone: data.totalDone
        }
      })
    })

    dispatch({
      type: 'RM',
      requestId: action.requestId,
      ready: true,
      result: {
        totalDone: data.totalDone
      }
    })
  } catch (err) {
    dispatch({
      type: 'RM',
      requestId: action.requestId,
      ready: true,
      error: { message: err.message }
    })
  }
}

/**
 * Traverses source URIs. Maps every source file to a destination file.
 * Initializes fields to keep track of processed size.
 */
Worker.prototype.prepare = function (destUri, srcUris) {
  const dest = Gio.file_new_for_uri(destUri)

  const isDestExistingDir = dest.query_exists(null) && dest.query_info(
    'standard::*',
    Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS,
    null
  ).get_file_type() === Gio.FileType.DIRECTORY

  const willCreateDest = srcUris.length === 1 && !isDestExistingDir

  const data = srcUris.reduce((prev, srcUri) => {
    const src = Gio.file_new_for_uri(srcUri)
    const srcName = src.get_basename()
    const splice = srcUri[srcUri.length - 1] === '/' || willCreateDest
    const data = this.flatten(src)

    data.files.forEach(file => {
      if (!splice && !file.relativePath) {
        file.destUri = dest.get_child(srcName).get_uri()
        file.dest = Gio.file_new_for_uri(file.destUri)
        return
      }

      if (!splice && file.relativePath) {
        file.destUri = dest.get_child(srcName).get_child(file.relativePath).get_uri()
        file.dest = Gio.file_new_for_uri(file.destUri)
        return
      }

      if (splice && !file.relativePath) {
        file.destUri = dest.get_uri()
        file.dest = dest
        return
      }

      if (splice && file.relativePath) {
        file.destUri = dest.get_child(file.relativePath).get_uri()
        file.dest = Gio.file_new_for_uri(file.destUri)
      }
    })

    prev.files = prev.files.concat(data.files)
    prev.totalSize += data.totalSize

    return prev
  }, { files: [], totalSize: 0, totalDoneSize: 0 })

  return data
}

/**
 * Creates a given directory if it doesn't exist. Copies source attributes
 * to the destination.
 */
Worker.prototype.cpDirNode = function (file) {
  if (!file.dest.query_exists(null)) {
    file.dest.make_directory(null)
  }

  file.gFile.copy_attributes(
    file.dest,
    Gio.FileCopyFlags.ALL_METADATA,
    null
  )
}

/**
 * Given a point in a file hierarchy, finds all files and their total size.
 */
Worker.prototype.flatten = function (gFile) {
  const data = { files: [], totalSize: 0 }

  const handleFile = (file) => {
    data.files.push(file)
    data.totalSize += file.gFileInfo.get_size()

    if (file.gFileInfo.get_file_type() === Gio.FileType.DIRECTORY) {
      this.children(gFile, file.gFile).forEach(handleFile)
    }
  }

  const file = {
    gFile: gFile,
    gFileInfo: gFile.query_info(
      'standard::*',
      Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS,
      null
    ),
    relativePath: null
  }

  handleFile(file)

  return data
}

/**
 * For every child of a parent, gets Gio.File and Gio.FileInfo references
 * and a path relative to the given ancestor.
 */
Worker.prototype.children = function (ancestor, parent) {
  const enumerator = parent.enumerate_children(
    'standard::*',
    Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS,
    null
  )

  const files = []

  while (true) {
    const gFileInfo = enumerator.next_file(null)

    if (!gFileInfo) {
      break
    }

    const gFile = parent.get_child(gFileInfo.get_name())

    files.push({
      gFile: gFile,
      gFileInfo: gFileInfo,
      relativePath: ancestor.get_relative_path(gFile)
    })
  }

  return files
}

exports.Worker = Worker
