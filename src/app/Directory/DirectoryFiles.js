const Component = require("inferno-component").default;
const { connect } = require("inferno-mobx");
const { File } = require("../../domain/File/File");
const { autoBind } = require("../Gjs/autoBind");
const { h } = require("../Gjs/GtkInferno");
const { TabService } = require("../Tab/TabService");
const { TreeViewBody } = require("../TreeView/TreeViewBody");
const { DirectoryFile } = require("./DirectoryFile");

/**
 * @typedef IProps
 * @property {number} tabId
 * @property {TabService?} [tabService]
 *
 * @extends Component<IProps>
 */
class DirectoryFiles extends Component {
  /**
   * @param {IProps} props
   */
  constructor(props) {
    super(props);
    autoBind(this, DirectoryFiles.prototype, __filename);
  }

  render() {
    const tabId = this.props.tabId;
    const { entities, visibleFiles } =
      /** @type {TabService} */ (this.props.tabService);

    const files = visibleFiles[tabId];
    const selected = entities[tabId].selected;

    return (
      h(TreeViewBody, files.map((file, index) => {
        return h(DirectoryFile, {
          file,
          isSelected: selected.indexOf(index) !== -1,
          key: file.name,
        });
      }))
    );
  }
}

exports.DirectoryFiles = DirectoryFiles;
exports.default = connect(["tabService"])(DirectoryFiles);
