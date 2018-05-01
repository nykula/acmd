const { Pixbuf }  = imports.gi.GdkPixbuf;
const { Icon } = imports.gi.Gio;
const Component = require("inferno-component").default;
const { connect } = require("inferno-mobx");
const { File } = require("../../domain/File/File");
const { autoBind } = require("../Gjs/autoBind");
const { h } = require("../Gjs/GtkInferno");
const { ListStore } = require("../List/ListStore");
const { TabService } = require("../Tab/TabService");
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
      h(ListStore, { cols: DirectoryCols }, files.map((file, index) => {
        return h(DirectoryFile, {
          file,
          isSelected: selected.indexOf(index) !== -1,
          key: file.name,
        });
      }))
    );
  }
}

const DirectoryCols = [
  { name: "isSelected", type: Boolean },
  { name: "icon", type: Icon },
  { name: "pixbuf", type: Pixbuf },
  { name: "filename" },
  { name: "ext" },
  { name: "size" },
  { name: "mtime" },
  { name: "mode" },
];

exports.DirectoryCols = DirectoryCols;
exports.DirectoryFiles = DirectoryFiles;
exports.default = connect(["tabService"])(DirectoryFiles);
