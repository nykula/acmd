const { File } = imports.gi.Gio;
const GLib = imports.gi.GLib;
const { ClipboardService } = require("../Clipboard/ClipboardService");
const { DialogService } = require("../Dialog/DialogService");
const { GioService } = require("../Gio/GioService");
const { autoBind } = require("../Gjs/autoBind");
const { Fun } = require("../Gjs/Fun");
const { JobService } = require("../Job/JobService");
const { PanelService } = require("../Panel/PanelService");

class DirectoryService {
  /**
   * @typedef IProps
   * @property {ClipboardService} clipboardService
   * @property {DialogService} dialogService
   * @property {GioService} gioService
   * @property {JobService} jobService
   * @property {PanelService} panelService
   *
   * @param {IProps} props
   */
  constructor(props) {
    this.props = props;
    autoBind(this, DirectoryService.prototype, __filename);
  }

  /**
   * Executes command in directory. If begins with "javascript:", evaluates
   * code instead.
   *
   * @param {string} cmd
   */
  exec(cmd) {
    if (cmd.indexOf("javascript:") === 0) {
      Fun(cmd.slice("javascript:".length))();
      return;
    }

    const { dialogService, gioService } = this.props;
    const location = this.getLocation();

    if (location.indexOf("file:///") !== 0) {
      dialogService.alert("Operation not supported.");
      return;
    }

    gioService.spawn({
      argv: GLib.shell_parse_argv(cmd)[1],
      cwd: location.replace(/^file:\/\//, ""),
    });
  }

  /**
   * Creates a child directory, prompting for name.
   */
  mkdir() {
    const { dialogService, gioService, panelService } = this.props;
    const location = this.getLocation();

    dialogService.prompt("Name of the new dir:", "", name => {
      if (!name) {
        return;
      }

      const uri = this.getChild(location, name);

      gioService.mkdir(uri, error => {
        if (error) {
          dialogService.alert(error.message);
          return;
        }

        panelService.refresh();
      });
    });
  }

  /**
   * Copies or cuts files into directory, depending on how the origin
   * app marked the list written to clipboard.
   */
  paste() {
    const { paste } = this.props.clipboardService;
    const { alert } = this.props.dialogService;
    const { run } = this.props.jobService;
    const { refresh } = this.props.panelService;

    paste((_, text) => {
      if (!text) {
        alert("No text in clipboard.");
        return;
      }

      const uris = text.split("\n").filter(x => !!x.length);
      const action = uris.shift();

      if (action !== "copy" && action !== "cut") {
        alert("No files have been copied or cut.");
        return;
      }

      const location = this.getLocation();

      run(
        {
          destUri: location,
          type: action === "copy" ? "cp" : "mv",
          uris,
        },
        refresh,
      );
    });
  }

  /**
   * Runs terminal in directory, with shell if no arguments given.
   *
   * @param {(string[])=} argv
   */
  terminal(argv) {
    const { dialogService, gioService } = this.props;

    const location = this.getLocation();

    if (location.indexOf("file:///") !== 0) {
      dialogService.alert("Operation not supported.");
      return;
    }

    gioService.spawn({
      argv: ["x-terminal-emulator"].concat(argv || []),
      cwd: location.replace(/^file:\/\//, ""),
    });
  }

  /**
   * Creates file in directory, prompting for name. If exists, bumps
   * modification time.
   */
  touch() {
    const { dialogService, gioService, panelService } = this.props;
    const location = this.getLocation();

    dialogService.prompt("Name of the new file:", "", name => {
      if (!name) {
        return;
      }

      const uri = this.getChild(location, name);

      gioService.touch(uri, error => {
        if (error) {
          dialogService.alert(error.message);
          return;
        }

        panelService.refresh();
      });
    });
  }

  /**
   * Returns child URI. Expects location obtained before prompt.
   *
   * @private
   * @param {string} location
   * @param {string} name
   */
  getChild(location, name) {
    name = name.replace(/\//g, "_");

    const gFile = File.new_for_uri(location);
    const uri = gFile.get_child(name).get_uri();

    return uri;
  }

  /**
   * Gets active directory URI.
   *
   * @private
   */
  getLocation() {
    const { panelService } = this.props;
    const { location } = panelService.getActiveTab();

    return location;
  }
}

exports.DirectoryService = DirectoryService;
