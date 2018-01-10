const { File } = imports.gi.Gio;
const Nullthrows = require("nullthrows").default;
const { DialogService } = require("../Dialog/DialogService");
const { autoBind } = require("../Gjs/autoBind");
const { JobService } = require("../Job/JobService");
const { PanelService } = require("../Panel/PanelService");
const { SelectService } = require("../Select/SelectService");
const { TabService } = require("../Tab/TabService");
const { UriService } = require("../Uri/UriService");

/**
 * Copies and moves files between panels.
 */
class OppositeService {
  /**
   * @typedef IProps
   * @property {DialogService?} [dialogService]
   * @property {JobService?} [jobService]
   * @property {PanelService?} [panelService]
   * @property {SelectService?} [selectService]
   * @property {TabService?} [tabService]
   * @property {UriService?} [uriService]
   *
   * @param {IProps} props
   */
  constructor(props) {
    this.props = props;
    autoBind(this, OppositeService.prototype, __filename);
  }

  cp() {
    const { alert, prompt } = Nullthrows(this.props.dialogService);
    const { run } = Nullthrows(this.props.jobService);
    const { refresh } = Nullthrows(this.props.panelService);
    const { normalize } = Nullthrows(this.props.uriService);

    const { destUri, uris, urisStr } = this.getUris();

    if (!uris.length) {
      alert("Select a file.");
      return;
    }

    prompt(`Copy ${urisStr} to:`, destUri, finalDestUri => {
      if (!finalDestUri) {
        return;
      }

      run(
        {
          destUri: normalize(finalDestUri),
          type: "cp",
          uris,
        },
        refresh,
      );
    });
  }

  mv() {
    const { alert, prompt } = Nullthrows(this.props.dialogService);
    const { normalize } = Nullthrows(this.props.uriService);
    const { run } = Nullthrows(this.props.jobService);
    const { refresh } = Nullthrows(this.props.panelService);

    const { destUri, uris, urisStr } = this.getUris();

    if (!uris.length) {
      alert("Select a file.");
      return;
    }

    prompt(`Move ${urisStr} to:`, destUri, finalDestUri => {
      if (!finalDestUri) {
        return;
      }

      run(
        {
          destUri: normalize(finalDestUri),
          type: "mv",
          uris,
        },
        refresh,
      );
    });
  }

  /**
   * Returns destination URI, including filename if only one file selected.
   *
   * @private
   */
  getDest() {
    const { activeId, getActiveTab } = Nullthrows(this.props.panelService);
    const { getFiles } = Nullthrows(this.props.selectService);

    const destPanelId = activeId === 0 ? 1 : 0;
    const { location } = getActiveTab(destPanelId);

    const gFile = File.new_for_uri(location);
    const files = getFiles();

    return files.length === 1
      ? gFile.get_child(files[0].name).get_uri()
      : gFile.get_uri();
  }

  /**
   * Gets source and destination URIs for dialog and worker.
   *
   * @private
   */
  getUris() {
    const { unescape } = Nullthrows(this.props.uriService);
    const { formatUris, getUris } = Nullthrows(this.props.selectService);

    const destUri = unescape(this.getDest());
    const uris = getUris();
    const urisStr = formatUris();

    return {
      destUri,
      uris,
      urisStr,
    };
  }
}

exports.OppositeService = OppositeService;
