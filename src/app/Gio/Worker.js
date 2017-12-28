const { File, FileCopyFlags, FileQueryInfoFlags, FileType } = imports.gi.Gio;
const { WorkerError } = require("../../domain/Gio/WorkerError");
const { WorkerProgress } = require("../../domain/Gio/WorkerProgress");
const { WorkerProps } = require("../../domain/Gio/WorkerProps");
const { WorkerSuccess } = require("../../domain/Gio/WorkerSuccess");
const { autoBind } = require("../Gjs/autoBind");

/**
 * Tasks intended to run in a separate process because they are heavy on IO or
 * GObject Introspection doesn't provide respective asynchronous methods.
 */
class Worker {
  /**
   * @param {File} gFile
   */
  static flatten(gFile) {
    /** @type {any} */
    const props = undefined;

    /** @type {any} */
    const emit = undefined;

    return new Worker(props, emit).flatten(gFile);
  }

  /**
   * @param {WorkerProps} props
   * @param {(event: WorkerError | WorkerProgress | WorkerSuccess) => void} emit
   */
  constructor(props, emit, Gio = imports.gi.Gio) {
    this.emit = emit;
    this.Gio = Gio;
    this.props = props;
    autoBind(this, Worker.prototype, __filename);
  }

  /**
   * Performs the requested action.
   */
  run() {
    try {
      this[this.props.type]();
    } catch (error) {
      this.emit({
        message: error.message,
        stack: error.stack,
        type: "error",
      });
      return;
    }

    this.emit({ type: "success" });
  }

  /**
   * Copies sources to a destination directory. Recurses if a source is a
   * directory. Splices the first URI component relative to the source if the
   * source URI ends with a slash, or if there is only one source URI and the
   * destination isn't an existing directory.
   */
  cp() {
    const data = this.prepare();
    data.files.forEach((file, totalDoneCount) => {
      if (file.gFileInfo.get_file_type() === FileType.DIRECTORY) {
        this.cpDirNode(file);
        return;
      }
      const uri = file.gFile.get_uri();
      const dest = file.dest.get_uri();
      /** @type {File} */
      const gFile = file.gFile;
      gFile.copy(
        file.dest,
        FileCopyFlags.OVERWRITE +
        FileCopyFlags.NOFOLLOW_SYMLINKS +
        FileCopyFlags.ALL_METADATA,
        null,
        (doneSize, size) => {
          this.emit({
            dest,
            doneSize,
            size,
            totalCount: data.files.length,
            totalDoneCount,
            totalDoneSize: data.totalDoneSize + doneSize,
            totalSize: data.totalSize,
            type: "progress",
            uri,
          });
        },
      );

      data.totalDoneSize += file.gFileInfo.get_size();
    });
  }

  /**
   * Moves sources to a destination directory. Uses cp followed by rm.
   */
  mv() {
    this.cp();
    this.rm();
  }

  /**
   * Deletes files. Recurses into directories.
   */
  rm() {
    /** @type {any[]} */
    const gFiles = this.props.uris.map(x => this.Gio.file_new_for_uri(x));

    /**
     * @type {any[]}
     */
    const files = gFiles.reduce((prev, gFile) => {
      return prev.concat(this.flatten(gFile).files);
    }, []);

    files.reverse();

    files.forEach((file, totalDoneCount) => {
      const uri = file.gFile.get_uri();
      file.gFile.delete(null);

      this.emit({
        dest: "",
        doneSize: 0,
        size: 0,
        totalCount: files.length,
        totalDoneCount,
        totalDoneSize: 0,
        totalSize: 0,
        type: "progress",
        uri,
      });
    });
  }

  /**
   * Traverses source URIs. Maps every source file to a destination file.
   * Initializes fields to keep track of processed size.
   */
  prepare() {
    const { destUri, uris } = this.props;

    const dest = this.Gio.file_new_for_uri(destUri);

    const isDestExistingDir =
      dest.query_exists(null) &&
      dest
        .query_info("standard::*", FileQueryInfoFlags.NOFOLLOW_SYMLINKS, null)
        .get_file_type() === FileType.DIRECTORY;

    const willCreateDest = uris.length === 1 && !isDestExistingDir;

    /** @type {any[]} */
    const files = [];

    const data = {
      files,
      totalDoneSize: 0,
      totalSize: 0,
    };

    for (const srcUri of uris) {
      const src = this.Gio.file_new_for_uri(srcUri);
      const srcName = src.get_basename();
      const splice = srcUri[srcUri.length - 1] === "/" || willCreateDest;
      const uriData = this.flatten(src);

      uriData.files.forEach(file => {
        if (!splice && !file.relativePath) {
          file.destUri = dest.get_child(srcName).get_uri();
          file.dest = this.Gio.file_new_for_uri(file.destUri);
          return;
        }

        if (!splice && file.relativePath) {
          file.destUri = dest
            .get_child(srcName)
            .get_child(file.relativePath)
            .get_uri();
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

      data.files = data.files.concat(uriData.files);
      data.totalSize += uriData.totalSize;
    }

    return data;
  }

  /**
   * Creates a given directory if it doesn't exist. Copies source attributes
   * to the destination.
   *
   * @param {any} file
   */
  cpDirNode(file) {
    if (!file.dest.query_exists(null)) {
      file.dest.make_directory(null);
    }

    file.gFile.copy_attributes(file.dest, FileCopyFlags.ALL_METADATA, null);
  }

  /**
   * Given a point in a file hierarchy, finds all files and their total size.
   *
   * @param {File} gFile
   */
  flatten(gFile) {
    /** @type {{ dest: File, destUri: string, relativePath: string }[]} */
    const files = [];

    const data = {
      files,
      totalSize: 0,
    };

    /**
     * @param {any} x
     */
    const handleFile = x => {
      data.files.push(x);
      data.totalSize += x.gFileInfo.get_size();

      if (x.gFileInfo.get_file_type() === FileType.DIRECTORY) {
        this.children(gFile, x.gFile).forEach(handleFile);
      }
    };

    const relativePath = "";

    const file = {
      gFile: gFile,
      gFileInfo: gFile.query_info(
        "standard::*",
        FileQueryInfoFlags.NOFOLLOW_SYMLINKS,
        null,
      ),
      relativePath,
    };

    handleFile(file);

    return data;
  }

  /**
   * For every child of a parent, gets Gio.File and Gio.FileInfo references
   * and a path relative to the given ancestor.
   *
   * @param {File} ancestor
   * @param {File} parent
   */
  children(ancestor, parent) {
    const enumerator = parent.enumerate_children(
      "standard::*",
      FileQueryInfoFlags.NOFOLLOW_SYMLINKS,
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
  }
}

exports.Worker = Worker;
