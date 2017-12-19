const { File } = imports.gi.Gio;
const { DialogService } = require("../Dialog/DialogService");
const { autoBind } = require("../Gjs/autoBind");
const { JobService } = require("../Job/JobService");
const { PanelService } = require("../Panel/PanelService");
const { SelectService } = require("../Select/SelectService");
const { TabService } = require("../Tab/TabService");

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
   *
   * @param {IProps} props
   */
  constructor(props) {
    this.props = props;
    autoBind(this, OppositeService.prototype, __filename);
  }

  cp() {
    const { prompt } =
      /** @type {DialogService} */ (this.props.dialogService);

    const { run } =
    /** @type {JobService} */ (this.props.jobService);

    const { refresh } =
    /** @type {PanelService} */ (this.props.panelService);

    const { destUri, uris, urisStr } = this.getUris();

    prompt(`Copy ${urisStr} to:`, destUri, finalDestUri => {
      if (!finalDestUri) {
        return;
      }

      run(
        {
          destUri: encodeURI(finalDestUri),
          type: "cp",
          uris,
        },
        refresh,
      );
    });
  }

  mv() {
    const { prompt } =
      /** @type {DialogService} */ (this.props.dialogService);

    const { run } =
    /** @type {JobService} */ (this.props.jobService);

    const { refresh } =
    /** @type {PanelService} */ (this.props.panelService);

    const { destUri, uris, urisStr } = this.getUris();

    prompt(`Move ${urisStr} to:`, destUri, finalDestUri => {
      if (!finalDestUri) {
        return;
      }

      run(
        {
          destUri: encodeURI(finalDestUri),
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
    const { activeId, getActiveTab } =
      /** @type {PanelService} */ (this.props.panelService);

    const { getFiles } =
    /** @type {SelectService} */ (this.props.selectService);

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
    const { formatUris, getUris } =
      /** @type {SelectService} */ (this.props.selectService);

    const destUri = decodeURI(this.getDest());
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
