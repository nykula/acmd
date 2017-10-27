const Gio = imports.gi.Gio;
const { WorkerError } = require("../../domain/Gio/WorkerError");
const { WorkerProgress } = require("../../domain/Gio/WorkerProgress");
const { WorkerProps } = require("../../domain/Gio/WorkerProps");
const { WorkerSuccess } = require("../../domain/Gio/WorkerSuccess");
const autoBind = require("../Gjs/autoBind").default;

/**
 * Tasks intended to run in a separate process because they are heavy on IO or
 * GObject Introspection doesn't provide respective asynchronous methods.
 *
 * @param {WorkerProps} props
 * @param {(event: WorkerError | WorkerProgress | WorkerSuccess) => void} emit
 */
function Worker(props, emit, Gio = imports.gi.Gio) {
  this.emit = emit;
  this.Gio = Gio;
  this.props = props;
  autoBind(this, Worker.prototype);
}

/**
 * Performs the requested action.
 */
Worker.prototype.run = function() {
  try {
    this[this.props.type]();
  } catch (error) {
    this.emit({
      type: "error",
      message: error.message,
      stack: error.stack,
    });
    return;
  }

  this.emit({ type: "success" });
};

/**
 * Copies sources to a destination directory. Recurses if a source is a
 * directory. Splices the first URI component relative to the source if the
 * source URI ends with a slash, or if there is only one source URI and the
 * destination isn't an existing directory.
 */
Worker.prototype.cp = function() {
  const data = this.prepare();

  data.files.forEach((file, totalDoneCount) => {
    if (file.gFileInfo.get_file_type() === Gio.FileType.DIRECTORY) {
      this.cpDirNode(file);
      return;
    }

    const uri = file.gFile.get_uri();
    const dest = file.dest.get_uri();

    file.gFile.copy(
      file.dest,
      Gio.FileCopyFlags.OVERWRITE + Gio.FileCopyFlags.NOFOLLOW_SYMLINKS + Gio.FileCopyFlags.ALL_METADATA,
      null,
      (doneSize, size) => {
        this.emit({
          type: "progress",
          uri,
          dest,
          doneSize,
          size,
          totalDoneSize: data.totalDoneSize + doneSize,
          totalSize: data.totalSize,
          totalDoneCount,
          totalCount: data.files.length,
        });
      },
    );

    data.totalDoneSize += file.gFileInfo.get_size();
  });
};

/**
 * Moves sources to a destination directory. Uses cp followed by rm.
 */
Worker.prototype.mv = function() {
  this.cp();
  this.rm();
};

/**
 * Deletes files. Recurses into directories.
 */
Worker.prototype.rm = function() {
  /** @type {any[]} */
  const gFiles = this.props.uris.map(x => this.Gio.file_new_for_uri(x));

  const files = gFiles.reduce((prev, gFile) => {
    return prev.concat(this.flatten(gFile).files);
  }, []);

  files.reverse();

  files.forEach((file, totalDoneCount) => {
    const uri = file.gFile.get_uri();
    file.gFile.delete(null);

    this.emit({
      type: "progress",
      uri,
      dest: "",
      doneSize: 0,
      size: 0,
      totalDoneSize: 0,
      totalSize: 0,
      totalDoneCount,
      totalCount: files.length,
    });
  });
};

/**
 * Traverses source URIs. Maps every source file to a destination file.
 * Initializes fields to keep track of processed size.
 */
Worker.prototype.prepare = function() {
  const { destUri, uris } = this.props;

  const dest = this.Gio.file_new_for_uri(destUri);

  const isDestExistingDir = dest.query_exists(null) && dest.query_info(
    "standard::*",
    Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS,
    null,
  ).get_file_type() === Gio.FileType.DIRECTORY;

  const willCreateDest = uris.length === 1 && !isDestExistingDir;

  const data = uris.reduce((prev, srcUri) => {
    const src = this.Gio.file_new_for_uri(srcUri);
    const srcName = src.get_basename();
    const splice = srcUri[srcUri.length - 1] === "/" || willCreateDest;
    const data = this.flatten(src);

    data.files.forEach(file => {
      if (!splice && !file.relativePath) {
        file.destUri = dest.get_child(srcName).get_uri();
        file.dest = this.Gio.file_new_for_uri(file.destUri);
        return;
      }

      if (!splice && file.relativePath) {
        file.destUri = dest.get_child(srcName).get_child(file.relativePath).get_uri();
        file.dest = this.Gio.file_new_for_uri(file.destUri);
        return;
      }

      if (splice && !file.relativePath) {
        file.destUri = dest.get_uri();
        file.dest = dest;
        return;
      }

      if (splice && file.relativePath) {
        file.destUri = dest.get_child(file.relativePath).get_uri();
        file.dest = this.Gio.file_new_for_uri(file.destUri);
      }
    });

    prev.files = prev.files.concat(data.files);
    prev.totalSize += data.totalSize;

    return prev;
  }, { files: [], totalSize: 0, totalDoneSize: 0 });

  return data;
};

/**
 * Creates a given directory if it doesn't exist. Copies source attributes
 * to the destination.
 */
Worker.prototype.cpDirNode = function(file) {
  if (!file.dest.query_exists(null)) {
    file.dest.make_directory(null);
  }

  file.gFile.copy_attributes(
    file.dest,
    Gio.FileCopyFlags.ALL_METADATA,
    null,
  );
};

/**
 * Given a point in a file hierarchy, finds all files and their total size.
 */
Worker.prototype.flatten = function(gFile) {
  const data = { files: [], totalSize: 0 };

  const handleFile = (file) => {
    data.files.push(file);
    data.totalSize += file.gFileInfo.get_size();

    if (file.gFileInfo.get_file_type() === Gio.FileType.DIRECTORY) {
      this.children(gFile, file.gFile).forEach(handleFile);
    }
  };

  const file = {
    gFile: gFile,
    gFileInfo: gFile.query_info(
      "standard::*",
      Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS,
      null,
    ),
    relativePath: null,
  };

  handleFile(file);

  return data;
};

/**
 * For every child of a parent, gets Gio.File and Gio.FileInfo references
 * and a path relative to the given ancestor.
 */
Worker.prototype.children = function(ancestor, parent) {
  const enumerator = parent.enumerate_children(
    "standard::*",
    Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS,
    null,
  );

  const files = [];

  while (true) {
    const gFileInfo = enumerator.next_file(null);

    if (!gFileInfo) {
      break;
    }

    const gFile = parent.get_child(gFileInfo.get_name());

    files.push({
      gFile,
      gFileInfo,
      relativePath: ancestor.get_relative_path(gFile),
    });
  }

  return files;
};

exports.Worker = Worker;
