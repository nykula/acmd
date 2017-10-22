exports.default = (props) => ({
  alert: exports.alert(props),
  confirm: exports.confirm(props),
  prompt: exports.prompt(props)
})

exports.alert = ({ Gtk, win }) => (text, callback) => {
  const dialog = new Gtk.MessageDialog({
    buttons: Gtk.ButtonsType.CLOSE,
    modal: true,
    text: text,
    transient_for: win,
    window_position: Gtk.WindowPosition.CENTER
  })

  dialog.connect('response', () => {
    dialog.destroy()
    callback()
  })

  dialog.show()
}

exports.confirm = ({ Gtk, win }) => (text, callback) => {
  const dialog = new Gtk.MessageDialog({
    buttons: Gtk.ButtonsType.YES_NO,
    modal: true,
    text: text,
    transient_for: win,
    window_position: Gtk.WindowPosition.CENTER
  })

  dialog.connect('response', (_, response) => {
    dialog.destroy()

    if (response === Gtk.ResponseType.YES) {
      callback(true)
      return
    }

    if (response === Gtk.ResponseType.NO) {
      callback(false)
      return
    }

    callback(null)
  })

  dialog.show()
}

exports.prompt = ({ Gtk, win }) => (text, initialValue, callback) => {
  const dialog = new Gtk.MessageDialog({
    buttons: Gtk.ButtonsType.OK_CANCEL,
    modal: true,
    text: text,
    transient_for: win,
    window_position: Gtk.WindowPosition.CENTER
  })

  const entry = new Gtk.Entry({ text: initialValue })
  dialog.get_content_area().add(entry)
  entry.connect('activate', () => {
    const text = entry.text
    dialog.destroy()
    callback(text)
  })

  dialog.connect('response', (_, response) => {
    const text = entry.text
    dialog.destroy()

    if (response === Gtk.ResponseType.OK) {
      callback(text)
      return
    }

    if (response === Gtk.ResponseType.CANCEL) {
      callback(null)
      return
    }

    callback(null)
  })

  dialog.show_all()
}
