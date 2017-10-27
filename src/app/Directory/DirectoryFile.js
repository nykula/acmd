const Gio = imports.gi.Gio;
const Component = require("inferno-component").default;
const h = require("inferno-hyperscript").default;
const { connect } = require("inferno-mobx");
const { File } = require("../../domain/File/File");
const autoBind = require("../Gjs/autoBind").default;
const formatSize = require("../Size/formatSize").default;

/**
 * @typedef IProps
 * @property {File} file
 * @property {boolean} isSelected
 *
 * @param {IProps} props
 */
function DirectoryFile(props) {
  Component.call(this, props);
  autoBind(this, DirectoryFile.prototype);
}

DirectoryFile.prototype = Object.create(Component.prototype);

/** @type {IProps} */
DirectoryFile.prototype.props = undefined;

DirectoryFile.prototype.name = function() {
  const file = this.props.file;
  let filename = file.name;
  let ext = "";

  const matches = /^(.+)\.(.*?)$/.exec(file.name);

  if (file.fileType !== Gio.FileType.DIRECTORY && file.name !== ".." && matches) {
    filename = matches[1];
    ext = matches[2];
  }

  if (file.fileType === Gio.FileType.DIRECTORY) {
    filename = "[" + file.name + "]";
  }

  return [filename, ext];
};

DirectoryFile.prototype.size = function() {
  const file = this.props.file;
  return file.fileType === Gio.FileType.DIRECTORY ? "<DIR>" : formatSize(file.size);
};

DirectoryFile.prototype.mtime = function() {
  const time = this.props.file.modificationTime;
  const date = new Date(time * 1000);

  const month = ("00" + (date.getMonth() + 1)).slice(-2);
  const day = ("00" + (date.getDate())).slice(-2);
  const year = ("0000" + (date.getFullYear())).slice(-4);
  const hours = ("00" + (date.getHours())).slice(-2);
  const minutes = ("00" + (date.getMinutes())).slice(-2);

  return [month, day, year].join("/") + " " + [hours, minutes].join(":");
};

/**
 * @param {string} input
 */
DirectoryFile.prototype.shouldSearchSkip = function(input) {
  return this.props.file.name.toLowerCase().indexOf(input.toLowerCase()) !== 0;
};

DirectoryFile.prototype.render = function() {
  const { file, isSelected } = this.props;
  const [filename, ext] = this.name();

  return h("tree-view-row", {
    ext,
    filename,
    icon: file,
    isSelected,
    mode: file.mode,
    mtime: this.mtime(),
    shouldSearchSkip: this.shouldSearchSkip,
    size: this.size(),
  });
};

exports.DirectoryFile = DirectoryFile;
exports.default = connect([])(DirectoryFile);
