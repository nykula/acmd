const Component = require('inferno-component')
const h = require('inferno-hyperscript')
const isEqual = require('lodash/isEqual')
const ListStore = require('../utils/ListStore')

const Select = exports.default = function Select (props) {
  Component.call(this, props)

  this.init = this.init.bind(this)
  this.updateActive = this.updateActive.bind(this)
}

Select.prototype = Object.create(Component.prototype)

Select.prototype.init = function (node) {
  if (!node || this.node) {
    return
  }

  this.node = node
  node.set_model(ListStore.fromProps(this.props))
  this.props.cols.forEach((col, i) => ListStore.configureColumn(node, col, i))
  this.updateActive()
}

Select.prototype.shouldComponentUpdate = function (nextProps) {
  return !isEqual(this.props, nextProps)
}

Select.prototype.componentDidUpdate = function () {
  this.node.set_model(ListStore.fromProps(this.props))
  this.updateActive()
}

Select.prototype.updateActive = function () {
  for (let i = 0; i < this.props.rows.length; i++) {
    if (this.props.rows[i].value === this.props.value) {
      this.node.set_active(i)
      break
    }
  }
}

Select.prototype.render = function () {
  return h('combo-box', {
    on_changed: this.props.on_changed,
    ref: this.init
  })
}
