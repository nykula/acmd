const {
  ButtonsType,
  Entry,
  MessageDialog,
  ResponseType,
  Window,
  WindowPosition,
} = imports.gi.Gtk;
const noop = require("lodash/noop");
const { autoBind } = require("../Gjs/autoBind");

class DialogService {
  /**
   * @param {Window} win
   */
  constructor(win) {
    autoBind(this, DialogService.prototype, __filename);
    this.win = win;
    this.Entry = Entry;
    this.MessageDialog = MessageDialog;
  }

  /**
   * @param {string} text
   * @param {(() => void)=} callback
   */
  alert(text, callback = noop) {
    const dialog = new this.MessageDialog({
      buttons: ButtonsType.CLOSE,
      modal: true,
      text: text,
      transient_for: this.win,
      window_position: WindowPosition.CENTER,
    });

    dialog.connect("response", () => {
      dialog.destroy();
      callback();
    });

    dialog.show();
  }

  /**
   * @param {string} text
   * @param {(result: boolean | null) => void} callback
   */
  confirm(text, callback) {
    const dialog = new this.MessageDialog({
      buttons: ButtonsType.YES_NO,
      modal: true,
      text: text,
      transient_for: this.win,
      window_position: WindowPosition.CENTER,
    });

    dialog.connect("response", (_, response) => {
      dialog.destroy();

      if (response === ResponseType.YES) {
        callback(true);
        return;
      }

      if (response === ResponseType.NO) {
        callback(false);
        return;
      }

      callback(null);
    });

    dialog.show();
  }

  /**
   * @param {string} text
   * @param {string} initialValue
   * @param {(text: string | null) => void} callback
   */
  prompt(text, initialValue, callback) {
    const dialog = new this.MessageDialog({
      buttons: ButtonsType.OK_CANCEL,
      modal: true,
      text: text,
      transient_for: this.win,
      window_position: WindowPosition.CENTER,
    });

    const entry = new this.Entry({ text: initialValue });
    dialog.get_content_area().add(entry);
    entry.connect("activate", () => {
      const entryText = entry.text;
      dialog.destroy();
      callback(entryText);
    });

    dialog.connect("response", (_, response) => {
      const entryText = entry.text;
      dialog.destroy();

      if (response === ResponseType.OK) {
        callback(entryText);
        return;
      }

      if (response === ResponseType.CANCEL) {
        callback(null);
        return;
      }

      callback(null);
    });

    dialog.show_all();
  }
}

exports.DialogService = DialogService;
