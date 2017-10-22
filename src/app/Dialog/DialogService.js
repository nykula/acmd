/**
 * @param {any} Gtk
 * @param {any} win
 */
function DialogService (Gtk, win) {
  this.Gtk = Gtk
  this.win = win
}

/**
 * @param {string} text
 * @param {() => void} callback
 */
DialogService.prototype.alert = function (text, callback) {
  const dialog = new this.Gtk.MessageDialog({
    buttons: this.Gtk.ButtonsType.CLOSE,
    modal: true,
    text: text,
    transient_for: this.win,
    window_position: this.Gtk.WindowPosition.CENTER
  })

  dialog.connect('response', () => {
    dialog.destroy()
    callback()
  })

  dialog.show()
}

/**
 * @param {string} text
 * @param {(result: boolean | null) => void} callback
 */
DialogService.prototype.confirm = function (text, callback) {
  const dialog = new this.Gtk.MessageDialog({
    buttons: this.Gtk.ButtonsType.YES_NO,
    modal: true,
    text: text,
    transient_for: this.win,
    window_position: this.Gtk.WindowPosition.CENTER
  })

  dialog.connect('response', (
    /** @type {any} */ _,
    /** @type {number} */ response
  ) => {
    dialog.destroy()

    if (response === this.Gtk.ResponseType.YES) {
      callback(true)
      return
    }

    if (response === this.Gtk.ResponseType.NO) {
      callback(false)
      return
    }

    callback(null)
  })

  dialog.show()
}

/**
 * @param {string} text
 * @param {string} initialValue
 * @param {(text: string | null) => void} callback
 */
DialogService.prototype.prompt = function (text, initialValue, callback) {
  const dialog = new this.Gtk.MessageDialog({
    buttons: this.Gtk.ButtonsType.OK_CANCEL,
    modal: true,
    text: text,
    transient_for: this.win,
    window_position: this.Gtk.WindowPosition.CENTER
  })

  const entry = new this.Gtk.Entry({ text: initialValue })
  dialog.get_content_area().add(entry)
  entry.connect('activate', () => {
    const text = entry.text
    dialog.destroy()
    callback(text)
  })

  dialog.connect('response', (
    /** @type {any} */ _,
    /** @type {number} */ response
  ) => {
    const text = entry.text
    dialog.destroy()

    if (response === this.Gtk.ResponseType.OK) {
      callback(text)
      return
    }

    if (response === this.Gtk.ResponseType.CANCEL) {
      callback(null)
      return
    }

    callback(null)
  })

  dialog.show_all()
}

exports.DialogService = DialogService
