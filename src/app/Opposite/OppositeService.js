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
    const { jobService, panelService } = this.props;
    const { prompt } = this.props.dialogService;
    const { destUri, uris, urisStr } = this.getUris();

    prompt("Copy " + urisStr + "to:", destUri, finalDestUri => {
      if (!finalDestUri) {
        return;
      }

      jobService.run(
        {
          destUri: encodeURI(finalDestUri),
          type: "cp",
          uris,
        },
        panelService.refresh,
      );
    });
  }

  mv() {
    const { jobService, panelService } = this.props;
    const { prompt } = this.props.dialogService;
    const { destUri, uris, urisStr } = this.getUris();

    prompt("Move " + urisStr + "to:", destUri, finalDestUri => {
      if (!finalDestUri) {
        return;
      }

      jobService.run(
        {
          destUri: encodeURI(finalDestUri),
          type: "mv",
          uris,
        },
        panelService.refresh,
      );
    });
  }

  /**
   * Returns destination URI, including filename if only one file selected.
   *
   * @private
   */
  getDest() {
    const { panelService, selectService, tabService } = this.props;
    const destPanelId = panelService.activeId === 0 ? 1 : 0;

    const { activeTabId } = panelService.entities[destPanelId];
    const { location } = tabService.entities[activeTabId];

    const gFile = File.new_for_uri(location);
    const files = selectService.getFiles();

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
    const { formatUris, getUris } = this.props.selectService;

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
