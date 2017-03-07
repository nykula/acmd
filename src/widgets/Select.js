/* global imports */
const GObject = imports.gi.GObject
const Gtk = imports.gi.Gtk
const isEqual = require('lodash/isEqual')

exports.default = function Select (props) {
  this.props = props
}

exports.default.prototype.type = 'Widget'

exports.default.prototype.name = 'Select'

exports.default.prototype.init = function () {
  let node

  const store = new Gtk.ListStore()
  store.set_column_types([
    GObject.TYPE_STRING,
    GObject.TYPE_STRING
  ])

  this.props.options.forEach(option => {
    const iter = store.append()
    store.set(iter, [0, 1], [option.text, option.icon])
  })

  node = new Gtk.ComboBox({ model: store })

  const rendererPixbuf = new Gtk.CellRendererPixbuf()
  const rendererText = new Gtk.CellRendererText()

  node.pack_start(rendererPixbuf, false)
  node.pack_end(rendererText, false)

  node.add_attribute(rendererText, 'text', 0)
  node.add_attribute(rendererPixbuf, 'icon-name', 1)

  for (let i = 0; i < this.props.options.length; i++) {
    if (this.props.options[i].value === this.props.value) {
      node.set_active(i)
      break
    }
  }

  node.connect('changed', this.props.on_changed)
  node.show()
  return node
}

exports.default.prototype.update = function (prev, node) {
  node.widget = this
  const willUpdate = !isEqual(this.props, prev.props)

  if (!willUpdate) {
    return null
  }

  if (!isEqual(prev.props, this.props)) {
    const nextNode = this.init(prev)

    const parent = node.parent
    node.parent.remove(node)
    parent.add(nextNode)

    return nextNode
  }

  return null
}

exports.default.prototype.destroy = function () {
}
