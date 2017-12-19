const { File } = imports.gi.Gio;
const { GioService } = require("../Gio/GioService");
const { autoBind } = require("../Gjs/autoBind");

/**
 * Exchanges URIs with other apps.
 */
class ClipboardService {
  /**
   * @param {{ gioService: GioService }} props
   */
  constructor(props) {
    this.path = File.new_for_uri(__dirname)
      .resolve_relative_path("../../../bin/clipboard.py")
      .get_uri();

    this.props = props;

    autoBind(this, ClipboardService.prototype, __filename);
  }

  /**
   * Copies files as URIs.
   *
   * @param {string[]} uris
   */
  copy(uris) {
    const { gioService } = this.props;
    gioService.communicate([this.path, "copy"].concat(uris));
  }

  /**
   * Cuts files as URIs.
   *
   * @param {string[]} uris
   */
  cut(uris) {
    const { gioService } = this.props;
    gioService.communicate([this.path, "cut"].concat(uris));
  }

  /**
   * Lists copied or cut files.
   *
   * @param {(error?: Error, text?: string) => void} callback
   */
  paste(callback) {
    const { gioService } = this.props;
    gioService.communicate([this.path, "paste"], callback);
  }
}

exports.ClipboardService = ClipboardService;
