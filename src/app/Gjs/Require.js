function Require(
  Gio = imports.gi.Gio,
  GLib = imports.gi.GLib,
  _imports = imports,
  _window = window,
) {
  this.Gio = Gio;
  this.GLib = GLib;
  this.imports = _imports;
  this.window = _window;

  this.accept = this.accept.bind(this);
  this.flatten = this.flatten.bind(this);
  this.getOrCreate = this.getOrCreate.bind(this);
  this.require = this.require.bind(this);
  this.requireClosure = this.requireClosure.bind(this);
  this.requireModule = this.requireModule.bind(this);
  this.resolve = this.resolve.bind(this);

  /**
   * Object where filenames of the modules that have ever been required are keys.
   */
  this.filenames = {};

  /**
   * Modules, indexed by filename.
   */
  this.cache = {};

  /**
   * Arrays of required modules, indexed by parent filename.
   */
  this.dependencies = {};

  /**
   * File system polling interval.
   */
  this.HMR_INTERVAL = 1000;

  /**
   * Delay to make sure file has finished being written.
   */
  this.HMR_TIMEOUT = 1000;

  /**
   * Regular expression to get current module path from error stack.
   */
  this.RE = /\n.*?@(.*?):/;

  /**
   * Creates function from string. Breaks coverage for the module defining it,
   * so defined in `./Fun` that is required when `require` is available.
   *
   * @type {any}
   */
  this.Fun = undefined;
}

/**
 * Invalidates cache and calls a function when a module file is changed.
 */
Require.prototype.accept = function(parentFilename, path, callback) {
  const filename = this.resolve(parentFilename, path);
  let lastContents = {};
  let isVerifyingChange = false;

  const handleChanged = () => {
    if (isVerifyingChange) {
      return;
    }

    isVerifyingChange = true;

    this.GLib.timeout_add(this.GLib.PRIORITY_DEFAULT, this.HMR_TIMEOUT, () => {
      this.flatten(filename).forEach(_filename => {
        if (!isVerifyingChange) {
          return;
        }

        const contents = String(this.GLib.file_get_contents(_filename)[1]);

        if (lastContents[_filename] !== contents) {
          lastContents[_filename] = contents;

          this.flatten(filename).forEach(__filename => {
            delete this.cache[__filename];
          });

          isVerifyingChange = false;
          callback();
        }
      });

      isVerifyingChange = false;
    }, null);
  };

  this.flatten(filename).forEach(_filename => {
    lastContents[_filename] = String(this.GLib.file_get_contents(_filename)[1]);
  });

  this.GLib.timeout_add(this.GLib.PRIORITY_DEFAULT, this.HMR_INTERVAL, () => {
    if (isVerifyingChange) {
      return true;
    }

    this.flatten(filename).forEach(_filename => {
      if (isVerifyingChange) {
        return;
      }

      const contents = String(this.GLib.file_get_contents(_filename)[1]);

      if (lastContents[_filename] !== contents) {
        handleChanged();
      }
    });

    return true;
  });
};

/**
 * Gets pathnames of a cached module and all its dependencies.
 */
Require.prototype.flatten = function(filename) {
  let result = [filename];
  let nextResult = null;
  let same = false;

  while (!same) {
    nextResult = result
      .reduce((prev, x) => prev.concat(this.dependencies[x]), result)
      .filter((x, i, a) => a.indexOf(x) === i);

    same = result.length === nextResult.length;
    result = nextResult;
  }

  return result;
};

/**
 * Returns a cached module or creates an empty one. Normalizes the path.
 */
Require.prototype.getOrCreate = function(path) {
  const filename = this.Gio.File.new_for_path(path).get_path();

  const module = this.cache[filename] || (this.cache[filename] = {
    hot: { accept: this.accept.bind(null, filename) },
    filename: filename,
    exports: {},
  });

  this.filenames[filename] = true;

  if (!this.dependencies[filename]) {
    this.dependencies[filename] = [];
  }

  return module;
};

/**
 * Defines __filename, __dirname, exports, module and require. Does just
 * enough to use some CommonJS from npm that isn't dependent on node.
 */
Require.prototype.require = function() {
  const window = this.window;

  Object.defineProperty(window, "__filename", {
    /**
     * Returns the full path to the module that requested it.
     */
    get: () => {
      const path = this.RE.exec(new Error().stack)[1];
      return this.Gio.File.new_for_path(path).get_path();
    },
  });

  Object.defineProperty(window, "__dirname", {
    /**
     * Returns the full path to the parent dir of the module that requested it.
     */
    get: () => {
      const path = this.RE.exec(new Error().stack)[1];
      return this.Gio.File.new_for_path(path).get_path().replace(/.[^/]+$/, "");
    },
  });

  Object.defineProperty(window, "exports", {
    /**
     * Returns the exports property of the module that requested it. Note: if
     * you refer to exports after reassigning module.exports, this won't behave
     * like CommonJS would.
     */
    get: () => {
      const path = this.RE.exec(new Error().stack)[1];
      const module = this.getOrCreate(path);
      return module.exports;
    },
  });

  Object.defineProperty(window, "module", {
    /**
     * Returns the meta object of the module that requested it, so you can
     * replace the default exported object if you really need to.
     */
    get: () => {
      const path = this.RE.exec(new Error().stack)[1];
      const module = this.getOrCreate(path);
      return module;
    },
  });

  Object.defineProperty(window, "require", {
    /**
     * Returns the require function bound to filename of the module that
     * requested it.
     */
    get: () => {
      const parentPath = this.RE.exec(new Error().stack)[1];
      const parentFilename = this.Gio.File.new_for_path(parentPath).get_path();

      const require = this.requireModule.bind(null, parentFilename);
      require.cache = this.cache;
      require.resolve = this.resolve.bind(null, parentFilename);
      return require;
    },
  });

  this.Fun = require("./Fun").default;

  exports.Require = Require;
};

/**
 * Gets a normalized local pathname. Understands Dot and Dot Dot, or looks into
 * node_modules up to the root. Adds '.js' suffix if omitted.
 */
Require.prototype.resolve = function(parentFilename, path) {
  let gFile;
  const dirnames = [];

  if (
    path === "." || path === ".." ||
    path.indexOf("./") === 0 || path.indexOf("../") === 0
  ) {
    dirnames.push(this.Gio.file_new_for_path(parentFilename).get_parent().get_path());
  } else {
    gFile = this.Gio.file_new_for_path(parentFilename);

    while ((gFile = gFile.get_parent())) {
      if (gFile.get_child("node_modules").query_exists(null)) {
        dirnames.push(gFile.get_child("node_modules").get_path());
      }
    }
  }

  if (!dirnames.length) {
    throw new Error("Path cannot be resolved: " + path);
  }

  let suffices = [
    "",
    ".js",
    "/index.js",
  ];

  if (path.indexOf("/") === -1) {
    suffices = dirnames.reduce((prev, dirname) => {
      gFile = this.Gio.file_new_for_path(dirname + "/" + path);
      gFile = gFile.get_child("package.json");

      if (!gFile.query_exists(null)) {
        return prev;
      }

      const contents = String(this.GLib.file_get_contents(gFile.get_path())[1]);
      const data = JSON.parse(contents);

      if (!data.main) {
        return prev;
      }

      return prev.concat(suffices.map(x => "/" + data.main + x));
    }, suffices);
  }

  for (let i = 0; i < dirnames.length; i++) {
    for (let j = 0; j < suffices.length; j++) {
      const filename = dirnames[i] + "/" + path.replace(/\/$/, "") + suffices[j];
      gFile = this.Gio.file_new_for_path(filename);

      if (!gFile.query_exists(null)) {
        continue;
      }

      const gFileInfo = gFile.query_info(
        "standard::*",
        this.Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS,
        null,
      );

      if (gFileInfo.get_file_type() === this.Gio.FileType.DIRECTORY) {
        continue;
      }

      return gFile.get_path();
    }
  }

  throw new Error("Module not found: " + path);
};

/**
 * Loads a module by evaluating file contents in a closure. For example, this
 * can be used to require lodash/toString, which Gjs can't import natively. Or
 * to reload a module that has been deleted from cache.
 */
Require.prototype.requireClosure = function(parentFilename, path) {
  const filename = this.resolve(parentFilename, path);

  if (this.cache[filename]) {
    return this.cache[filename].exports;
  }

  const contents = String(this.GLib.file_get_contents(filename)[1]);
  const dirname = this.Gio.file_new_for_path(parentFilename).get_parent().get_path();
  const module = this.getOrCreate(filename);

  const require = this.requireModule.bind(null, filename);
  require.cache = this.cache;
  require.resolve = this.resolve.bind(null, filename);

  this.Fun("exports", "require", "module", "__filename", "__dirname",
    contents,
  )(module.exports, require, module, filename, dirname);

  if (!this.dependencies[parentFilename]) {
    this.dependencies[parentFilename] = [filename];
  } else if (this.dependencies[parentFilename].indexOf(filename) === -1) {
    this.dependencies[parentFilename].push(filename);
  }

  return module.exports;
};

/**
 * Loads a module and returns its exports. Caches the module.
 */
Require.prototype.requireModule = function(parentFilename, path) {
  const filename = this.resolve(parentFilename, path);

  if (this.cache[filename]) {
    return this.cache[filename].exports;
  }

  if (this.filenames[filename]) {
    // The module has been deleted from cache.

    if (this.dependencies[filename]) {
      this.dependencies[filename].splice(0);
    }

    return this.requireClosure(parentFilename, path);
  }

  const parts = filename
    .replace(this.imports.searchPath[this.imports.searchPath.length - 2] + "/", "../")
    .replace(this.imports.searchPath[this.imports.searchPath.length - 1] + "/", "")
    .replace(/\.js$/, "")
    .split("/");

  if (parts[parts.length - 1] === "toString") {
    return this.requireClosure(parentFilename, path);
  }

  const module = this.getOrCreate(filename);
  let current = this.imports;
  parts.forEach(x => {
    current = current[x];
  });

  if (!this.dependencies[parentFilename]) {
    this.dependencies[parentFilename] = [filename];
  } else if (this.dependencies[parentFilename].indexOf(filename) === -1) {
    this.dependencies[parentFilename].push(filename);
  }

  return module.exports;
};
