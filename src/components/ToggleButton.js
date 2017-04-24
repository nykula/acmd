/* global imports */
const assign = require('lodash/assign')
const Component = require('inferno-component')
const Gtk = imports.gi.Gtk
const h = require('inferno-hyperscript')

exports.default = ToggleButton
function ToggleButton (props) {
  Component.call(this, props)
  this.ref = this.ref.bind(this)
  this.resetActive = this.resetActive.bind(this)
  this.node = null
}

ToggleButton.prototype = Object.create(Component.prototype)

ToggleButton.prototype.componentDidUpdate = function () {
  this.resetActive()
}

ToggleButton.prototype.ref = function (node) {
  this.node = node
  this.resetActive()
}

ToggleButton.prototype.resetActive = function () {
  if (this.node && this.props.active) {
    this.node.set_state_flags(Gtk.StateFlags.CHECKED, false)
  } else if (this.node) {
    this.node.unset_state_flags(Gtk.StateFlags.CHECKED)
  }
}

ToggleButton.prototype.render = function () {
  return (
    h('button', assign({}, this.props, {
      ref: this.ref
    }))
  )
}
