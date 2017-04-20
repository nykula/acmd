/* global imports */
const Component = require('inferno-component')
const { connect } = require('inferno-redux')
const h = require('inferno-hyperscript')
const Pango = imports.gi.Pango

exports.Location = Location
function Location (props) {
  Component.call(this, props)
  this.refList = this.refList.bind(this)
  this.refRow = this.refRow.bind(this)
  this.updateSelection = this.updateSelection.bind(this)
}

Location.prototype = Object.create(Component.prototype)

Location.prototype.componentDidMount = function () {
  this.updateSelection()
}

Location.prototype.componentDidUpdate = function (prevProps) {
  if (prevProps.isActive !== this.props.isActive) {
    this.updateSelection()
  }
}

Location.prototype.refList = function (node) {
  this.list = node
}

Location.prototype.refRow = function (node) {
  this.row = node
}

Location.prototype.updateSelection = function () {
  if (this.props.isActive) {
    this.list.select_row(this.row)
  } else {
    this.list.unselect_row(this.row)
  }
}

Location.prototype.render = function ({ location }) {
  const label = location.replace(/\/?$/, '/*').replace(/^file:\/\//, '')
  return (
    h('list-box', { ref: this.refList }, [
      h('list-box-row', { ref: this.refRow }, [
        h('box', { border_width: 2 }, [
          h('box', { border_width: 2 }),
          h('label', {
            label: label,
            ellipsize: Pango.EllipsizeMode.MIDDLE
          })
        ])
      ])
    ])
  )
}

exports.mapStateToProps = mapStateToProps
function mapStateToProps (state, { panelId }) {
  return {
    isActive: state.panels.activeId === panelId,
    location: state.entities.tabs[state.panels.activeTabId[panelId]].location
  }
}

exports.default = connect(mapStateToProps)(Location)
