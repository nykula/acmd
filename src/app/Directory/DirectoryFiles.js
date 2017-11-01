const Component = require("inferno-component").default;
const h = require("inferno-hyperscript").default;
const { connect } = require("inferno-mobx");
const { File } = require("../../domain/File/File");
const autoBind = require("../Gjs/autoBind").default;
const { TabService } = require("../Tab/TabService");
const { TreeViewBody } = require("../TreeView/TreeViewBody");
const { DirectoryFile } = require("./DirectoryFile");

/**
 * @typedef IProps
 * @property {number} tabId
 * @property {TabService} tabService
 *
 * @param {IProps} props
 */
function DirectoryFiles(props) {
  Component.call(this, props);
  autoBind(this, DirectoryFiles.prototype, __filename);
}

DirectoryFiles.prototype = Object.create(Component.prototype);

/** @type {IProps} */
DirectoryFiles.prototype.props = undefined;

DirectoryFiles.prototype.render = function() {
  const tabId = this.props.tabId;
  const { entities, visibleFiles } = this.props.tabService;

  const files = visibleFiles[tabId];
  const selected = entities[tabId].selected;

  return (
    h(TreeViewBody,
      files.map((file, index) => {
        return h(DirectoryFile, {
          file,
          isSelected: selected.indexOf(index) !== -1,
          key: file.name,
        });
      }),
    )
  );
};

exports.DirectoryFiles = DirectoryFiles;

exports.default = connect(["tabService"])(DirectoryFiles);
