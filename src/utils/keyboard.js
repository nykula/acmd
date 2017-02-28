const actions = require('../actions/keyboard')

exports.default = ({Gdk, win, dispatch}) => {
  const pressed = {}

  win.connect('key-press-event', (_, ev) => {
    const keyval = ev.get_keyval()[1]
    pressed[keyval] = true
  })

  win.connect('key-release-event', (_, ev) => {
    const keyval = ev.get_keyval()[1]

    dispatch(actions.keyReleased({
      Gdk: Gdk,
      pressed: pressed,
      which: keyval
    }))

    pressed[keyval] = false
  })
}
