/* global imports */
/* eslint-disable no-new-func */

const Gio = imports.gi.Gio
const GLib = imports.gi.GLib

/**
 * Assigns window.require globally and module.hot.accept in required modules.
 * Does just enough to use some CommonJS from npm not depending on node.js.
 * Make a pull request if you know how to fix error stack traces.
 */
function Require () {
  this.accept = this.accept.bind(this)
  this.flatten = this.flatten.bind(this)
  this.require = this.require.bind(this)
  this.resolve = this.resolve.bind(this)

  /**
   * Modules, indexed by filename.
   */
  this.cache = {}

  /**
   * Arrays of required modules, indexed by parent filename.
   */
  this.dependencies = {}

  /**
   * File system polling interval.
   */
  this.HMR_INTERVAL = 1000

  /**
   * Delay to make sure file has finished being written.
   */
  this.HMR_TIMEOUT = 1000
}

/**
 * Invalidates cache and calls a function when a module file is changed.
 */
Require.prototype.accept = function (parentFilename, path, callback) {
  const filename = this.resolve(parentFilename, path)
  let lastContents = {}
  let isVerifyingChange = false

  const handleChanged = () => {
    if (isVerifyingChange) {
      return
    }

    isVerifyingChange = true

    GLib.timeout_add(GLib.PRIORITY_DEFAULT, this.HMR_TIMEOUT, () => {
      this.flatten(filename).forEach(_filename => {
        if (!isVerifyingChange) {
          return
        }

        const contents = String(GLib.file_get_contents(_filename)[1])

        if (lastContents[_filename] !== contents) {
          lastContents[_filename] = contents

          this.flatten(filename).forEach(__filename => {
            delete this.cache[__filename]
          })

          isVerifyingChange = false
          callback()
        }
      })

      isVerifyingChange = false
    }, null)
  }

  this.flatten(filename).forEach(_filename => {
    lastContents[_filename] = String(GLib.file_get_contents(_filename)[1])
  })

  GLib.timeout_add(GLib.PRIORITY_DEFAULT, this.HMR_INTERVAL, () => {
    if (isVerifyingChange) {
      return true
    }

    this.flatten(filename).forEach(_filename => {
      if (isVerifyingChange) {
        return
      }

      const contents = String(GLib.file_get_contents(_filename)[1])

      if (lastContents[_filename] !== contents) {
        handleChanged()
      }
    })

    return true
  })
}

/**
 * Gets pathnames of a cached module and all its dependencies.
 */
Require.prototype.flatten = function (filename) {
  let result = [filename]
  let nextResult = null
  let same = false

  while (!same) {
    nextResult = result
      .reduce((prev, x) => prev.concat(this.dependencies[x]), result)
      .filter((x, i, a) => a.indexOf(x) === i)

    same = result.length === nextResult.length
    result = nextResult
  }

  return result
}

/**
 * Gets a normalized local pathname. Understands Dot and Dot Dot, or looks into
 * node_modules up to the root. Adds '.js' suffix if omitted.
 */
Require.prototype.resolve = function (parentFilename, path) {
  let gFile
  const dirnames = []

  if (
    path === '.' || path === '..' ||
    path.indexOf('./') === 0 || path.indexOf('../') === 0
  ) {
    dirnames.push(Gio.file_new_for_path(parentFilename).get_parent().get_path())
  } else {
    gFile = Gio.file_new_for_path(parentFilename)

    while ((gFile = gFile.get_parent())) {
      if (gFile.get_child('node_modules').query_exists(null)) {
        dirnames.push(gFile.get_child('node_modules').get_path())
      }
    }
  }

  if (!dirnames.length) {
    throw new Error('Path cannot be resolved: ' + path)
  }

  const suffixes = [
    '',
    '.js',
    '/index.js'
  ]

  for (let i = 0; i < dirnames.length; i++) {
    for (let j = 0; j < suffixes.length; j++) {
      const filename = dirnames[i] + '/' + path.replace(/\/$/, '') + suffixes[j]
      gFile = Gio.file_new_for_path(filename)

      if (!gFile.query_exists(null)) {
        continue
      }

      const gFileInfo = gFile.query_info(
        'standard::*',
        Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS,
        null
      )

      if (gFileInfo.get_file_type() === Gio.FileType.DIRECTORY) {
        continue
      }

      return gFile.get_path()
    }
  }

  throw new Error('Module not found: ' + path)
}

/**
 * Loads a module and returns its exports. Caches the module.
 */
Require.prototype.require = function (parentFilename, path) {
  parentFilename = Gio.file_new_for_path(parentFilename).get_path()
  const filename = this.resolve(parentFilename, path)

  if (this.cache[filename]) {
    return this.cache[filename].exports
  }

  if (!this.dependencies[filename]) {
    this.dependencies[filename] = []
  }

  // Restart dependency tracking if the module has been deleted from cache.
  if (this.dependencies[filename].length) {
    this.dependencies[filename].splice(0)
  }

  const contents = String(GLib.file_get_contents(filename)[1])
  const dirname = Gio.file_new_for_path(parentFilename).get_parent().get_path()

  const module = { exports: {}, parent: this.cache[parentFilename] }
  module.filename = filename
  module.hot = { accept: this.accept.bind(this, filename) }

  const require = this.require.bind(this, filename)
  require.cache = this.cache
  require.resolve = this.resolve.bind(this, filename)

  new Function('exports', 'require', 'module', '__filename', '__dirname',
    contents
  )(module.exports, require, module, filename, dirname)

  this.cache[filename] = module

  if (!this.dependencies[parentFilename]) {
    this.dependencies[parentFilename] = [filename]
  } else {
    this.dependencies[parentFilename].push(filename)
  }

  return module.exports
}

const _require = new Require()
window.require = _require.require.bind(_require, __filename)
window.require.cache = _require.cache
window.require.resolve = _require.resolve.bind(_require, __filename)
