/* global imports */
const { connect } = require('inferno-redux')
const Gtk = imports.gi.Gtk
const h = require('inferno-hyperscript')
const Icon = require('../utils/Icon').default
const minLength = require('../utils/minLength').default

exports.renderMount = props => {
  const { icon, iconType, name, isActive, short } = props
  return (
    h(isActive ? 'toggle-button' : 'button', {
      active: isActive,
      relief: Gtk.ReliefStyle.NONE,
      tooltip_text: name
    }, [
      h('box', { spacing: 4 }, [
        h('image', {
          gicon: Icon({ icon: icon, iconType: iconType }),
          icon_size: Gtk.IconSize.SMALL_TOOLBAR
        }),
        h('label', { label: short })
      ])
    ])
  )
}

exports.MountList = ({ panelId, mounts }) => (
  h('box', [
    mounts.names.map(x => mounts.entities[x]).map(mount => {
      return exports.renderMount({
        icon: mount.icon,
        iconType: mount.iconType,
        isActive: mounts.active[panelId] === mount.name,
        name: mount.name,
        short: minLength(mounts.names, mount.name)
      })
    })
  ])
)

exports.mapStateToProps = state => ({
  mounts: state.mounts
})

exports.default = connect(exports.mapStateToProps)(exports.MountList)
