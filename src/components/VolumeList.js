/* global imports */
const { connect } = require('inferno-redux')
const Gtk = imports.gi.Gtk
const h = require('inferno-hyperscript')

exports.renderVolume = ({ volume, isActive }) => {
  return (
    h(isActive ? 'toggle-button' : 'button', {
      active: isActive,
      relief: Gtk.ReliefStyle.NONE
    }, [
      h('box', { spacing: 4 }, [
        h('image', {
          icon_name: volume.icon_name + '-symbolic',
          icon_size: Gtk.IconSize.SMALL_TOOLBAR
        }),
        h('label', { label: volume.label })
      ])
    ])
  )
}

exports.VolumeList = ({ panelId, volumes }) => (
  h('box', [
    volumes.labels.map(x => volumes.entities[x]).map(volume => {
      return exports.renderVolume({
        volume: volume,
        isActive: volumes.active[panelId] === volume.label
      })
    })
  ])
)

exports.mapStateToProps = state => ({
  volumes: state.volumes
})

exports.default = connect(exports.mapStateToProps)(exports.VolumeList)
