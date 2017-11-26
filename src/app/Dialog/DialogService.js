const {
  ButtonsType,
  Entry,
  MessageDialog,
  ResponseType,
  Window,
  WindowPosition,
} = imports.gi.Gtk;
const noop = require("lodash/noop");

/**
 * @param {Window} win
 */
function DialogService(win, _Entry = Entry, _MessageDialog = MessageDialog) {
  this.win = win;
  this.Entry = _Entry;
  this.MessageDialog = _MessageDialog;
}

/**
 * @param {string} text
 * @param {(() => void)=} callback
 */
DialogService.prototype.alert = function(text, callback = noop) {
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
};

/**
 * @param {string} text
 * @param {(result: boolean | null) => void} callback
 */
DialogService.prototype.confirm = function(text, callback) {
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
};

/**
 * @param {string} text
 * @param {string} initialValue
 * @param {(text: string | null) => void} callback
 */
DialogService.prototype.prompt = function(text, initialValue, callback) {
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
    const text = entry.text;
    dialog.destroy();
    callback(text);
  });

  dialog.connect("response", (_, response) => {
    const text = entry.text;
    dialog.destroy();

    if (response === ResponseType.OK) {
      callback(text);
      return;
    }

    if (response === ResponseType.CANCEL) {
      callback(null);
      return;
    }

    callback(null);
  });

  dialog.show_all();
};

exports.DialogService = DialogService;
