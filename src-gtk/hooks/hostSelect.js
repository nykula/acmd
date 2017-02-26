/* global imports */
const GObject = imports.gi.GObject
const Gtk = imports.gi.Gtk
const isEqual = require('lodash/isEqual')
const Hook = fun => Object.create({ hook: fun })

exports.default = props => Hook(hostNode => {
  const isMounting = hostNode.get_children().length === 0
  const willUpdate = !isEqual(props, hostNode.props)

  if (!isMounting && !willUpdate) {
    return
  }

  hostNode.get_children().forEach(x => x.destroy())

  const store = new Gtk.ListStore()
  store.set_column_types([
    GObject.TYPE_STRING,
    GObject.TYPE_STRING
  ])

  props.options.forEach(option => {
    const iter = store.append()
    store.set(iter, [0, 1], [option.text, option.icon])
  })

  const node = new Gtk.ComboBox({ model: store })

  const rendererPixbuf = new Gtk.CellRendererPixbuf()
  const rendererText = new Gtk.CellRendererText()

  node.pack_start(rendererPixbuf, false)
  node.pack_end(rendererText, false)

  node.add_attribute(rendererText, 'text', 0)
  node.add_attribute(rendererPixbuf, 'icon-name', 1)

  for (let i = 0; i < props.options.length; i++) {
    if (props.options[i].value === props.value) {
      node.set_active(i)
      break
    }
  }

  node.connect('changed', props.on_changed)
  hostNode.add(node)
  node.show()
})
