/* global imports */
/* eslint-disable no-new-func */

const Gio = imports.gi.Gio
const GLib = imports.gi.GLib
const self = this || exports

/**
 * Object where filenames of the modules that have ever been required are keys.
 */
self.filenames = {}

/**
 * Modules, indexed by filename.
 */
self.cache = {}

/**
 * Arrays of required modules, indexed by parent filename.
 */
self.dependencies = {}

/**
 * File system polling interval.
 */
self.HMR_INTERVAL = 1000

/**
 * Delay to make sure file has finished being written.
 */
self.HMR_TIMEOUT = 1000

/**
 * Invalidates cache and calls a function when a module file is changed.
 */
self.accept = function (parentFilename, path, callback) {
  const filename = self.resolve(parentFilename, path)
  let lastContents = {}
  let isVerifyingChange = false

  const handleChanged = () => {
    if (isVerifyingChange) {
      return
    }

    isVerifyingChange = true

    GLib.timeout_add(GLib.PRIORITY_DEFAULT, self.HMR_TIMEOUT, () => {
      self.flatten(filename).forEach(_filename => {
        if (!isVerifyingChange) {
          return
        }

        const contents = String(GLib.file_get_contents(_filename)[1])

        if (lastContents[_filename] !== contents) {
          lastContents[_filename] = contents

          self.flatten(filename).forEach(__filename => {
            delete self.cache[__filename]
          })

          isVerifyingChange = false
          callback()
        }
      })

      isVerifyingChange = false
    }, null)
  }

  self.flatten(filename).forEach(_filename => {
    lastContents[_filename] = String(GLib.file_get_contents(_filename)[1])
  })

  GLib.timeout_add(GLib.PRIORITY_DEFAULT, self.HMR_INTERVAL, () => {
    if (isVerifyingChange) {
      return true
    }

    self.flatten(filename).forEach(_filename => {
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
self.flatten = function (filename) {
  let result = [filename]
  let nextResult = null
  let same = false

  while (!same) {
    nextResult = result
      .reduce((prev, x) => prev.concat(self.dependencies[x]), result)
      .filter((x, i, a) => a.indexOf(x) === i)

    same = result.length === nextResult.length
    result = nextResult
  }

  return result
}

/**
 * Returns a cached module or creates an empty one. Normalizes the path.
 */
self.getOrCreate = function (path) {
  const filename = Gio.File.new_for_path(path).get_path()

  const module = self.cache[filename] || (self.cache[filename] = {
    hot: { accept: self.accept.bind(null, filename) },
    filename: filename,
    exports: {}
  })

  self.filenames[filename] = true

  if (!self.dependencies[filename]) {
    self.dependencies[filename] = []
  }

  return module
}

/**
 * Defines __filename, __dirname, exports, module and require. Does just
 * enough to use some CommonJS from npm that isn't dependent on node.
 */
self.require = function () {
  Object.defineProperty(window, '__filename', {
    /**
     * Returns the full path to the module that requested it.
     */
    get: () => {
      const path = /\n.*?@(.*):/.exec(new Error().stack)[1]
      return Gio.File.new_for_path(path).get_path()
    }
  })

  Object.defineProperty(window, '__dirname', {
    /**
     * Returns the full path to the parent dir of the module that requested it.
     */
    get: () => {
      const path = /\n.*?@(.*):/.exec(new Error().stack)[1]
      return Gio.File.new_for_path(path).get_path().replace(/.[^/]+$/, '')
    }
  })

  Object.defineProperty(window, 'exports', {
    /**
     * Returns the exports property of the module that requested it. Note: if
     * you refer to exports after reassigning module.exports, this won't behave
     * like CommonJS would.
     */
    get: () => {
      const path = /\n.*?@(.*):/.exec(new Error().stack)[1]
      const module = self.getOrCreate(path)
      return module.exports
    }
  })

  Object.defineProperty(window, 'module', {
    /**
     * Returns the meta object of the module that requested it, so you can
     * replace the default exported object if you really need to.
     */
    get: () => {
      const path = /\n.*?@(.*):/.exec(new Error().stack)[1]
      const module = self.getOrCreate(path)
      return module
    }
  })

  Object.defineProperty(window, 'require', {
    /**
     * Returns the require function bound to filename of the module that
     * requested it.
     */
    get: () => {
      const parentPath = /\n.*?@(.*):/.exec(new Error().stack)[1]
      const parentFilename = Gio.File.new_for_path(parentPath).get_path()

      const require = self.requireModule.bind(null, parentFilename)
      require.cache = self.cache
      require.resolve = self.resolve.bind(null, parentFilename)
      return require
    }
  })
}

/**
 * Gets a normalized local pathname. Understands Dot and Dot Dot, or looks into
 * node_modules up to the root. Adds '.js' suffix if omitted.
 */
self.resolve = function (parentFilename, path) {
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

  let suffices = [
    '',
    '.js',
    '/index.js'
  ]

  if (path.indexOf('/') === -1) {
    suffices = dirnames.reduce((prev, dirname) => {
      gFile = Gio.file_new_for_path(dirname + '/' + path)
      gFile = gFile.get_child('package.json')

      if (!gFile.query_exists(null)) {
        return prev
      }

      const contents = String(GLib.file_get_contents(gFile.get_path())[1])
      const data = JSON.parse(contents)

      if (!data.main) {
        return prev
      }

      return prev.concat(suffices.map(x => '/' + data.main + x))
    }, suffices)
  }

  for (let i = 0; i < dirnames.length; i++) {
    for (let j = 0; j < suffices.length; j++) {
      const filename = dirnames[i] + '/' + path.replace(/\/$/, '') + suffices[j]
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
 * Loads a module by evaluating file contents in a closure. For example, this
 * can be used to require lodash/toString, which Gjs can't import natively. Or
 * to reload a module that has been deleted from cache.
 */
self.requireClosure = function (parentFilename, path) {
  const filename = self.resolve(parentFilename, path)

  if (self.cache[filename]) {
    return self.cache[filename].exports
  }

  const contents = String(GLib.file_get_contents(filename)[1])
  const dirname = Gio.file_new_for_path(parentFilename).get_parent().get_path()
  const module = self.getOrCreate(filename)

  const require = self.requireModule.bind(null, filename)
  require.cache = self.cache
  require.resolve = self.resolve.bind(null, filename)

  new Function('exports', 'require', 'module', '__filename', '__dirname',
    contents
  )(module.exports, require, module, filename, dirname)

  if (!self.dependencies[parentFilename]) {
    self.dependencies[parentFilename] = [filename]
  } else if (self.dependencies[parentFilename].indexOf(filename) === -1) {
    self.dependencies[parentFilename].push(filename)
  }

  return module.exports
}

/**
 * Loads a module and returns its exports. Caches the module.
 */
self.requireModule = function (parentFilename, path) {
  const filename = self.resolve(parentFilename, path)

  if (self.cache[filename]) {
    return self.cache[filename].exports
  }

  if (self.filenames[filename]) {
    // The module has been deleted from cache.

    if (self.dependencies[filename]) {
      self.dependencies[filename].splice(0)
    }

    return self.requireClosure(parentFilename, path)
  }

  const parts = filename
    .replace(imports.searchPath[imports.searchPath.length - 1] + '/', '')
    .replace(/\.js$/, '')
    .split('/')

  if (parts[parts.length - 1] === 'toString') {
    return self.requireClosure(parentFilename, path)
  }

  const module = self.getOrCreate(filename)
  let current = imports
  parts.forEach(x => {
    current = current[x]
  })

  if (!self.dependencies[parentFilename]) {
    self.dependencies[parentFilename] = [filename]
  } else if (self.dependencies[parentFilename].indexOf(filename) === -1) {
    self.dependencies[parentFilename].push(filename)
  }

  return module.exports
}
