/* global imports */
const actions = require('../actions')
const Component = require('inferno-component')
const { connect } = require('inferno-redux')
const Gtk = imports.gi.Gtk
const h = require('inferno-hyperscript')
const Icon = require('../utils/Icon').default
const minLength = require('../utils/minLength').default

exports.Mount = function (props) {
  Component.call(this, props)
  this.handleClicked = this.handleClicked.bind(this)
}

exports.Mount.prototype = Object.create(Component.prototype)

exports.Mount.prototype.handleClicked = function () {
  const { activeUri, dispatch, mount } = this.props
  const uri = mount.rootUri
  const isActive = mount.rootUri && activeUri.indexOf(uri) === 0

  const menu = new Gtk.Menu()
  let item

  if (uri !== activeUri) {
    item = new Gtk.MenuItem()
    item.label = 'Open'
    item.connect('activate', () => {
      dispatch(actions.ls(this.props.panelId, uri))
    })
    menu.add(item)
  }

  if (!isActive) {
    item = new Gtk.MenuItem()
    item.label = 'Unmount'
    item.connect('activate', () => {
      dispatch(actions.unmount(mount.rootUri))
    })
    menu.add(item)
  }

  if (!mount.rootUri) {
    item = new Gtk.MenuItem()
    item.label = 'Mount'
    item.connect('activate', () => {
      dispatch(actions.mount(mount.uuid))
    })
    menu.add(item)
  }

  if (!item) {
    return
  }

  menu.show_all()
  menu.popup(null, null, null, null, null)
}

exports.Mount.prototype.render = function () {
  const { mount, isActive, short } = this.props
  const { icon, iconType, name } = mount
  return (
    h(isActive ? 'toggle-button' : 'button', {
      active: isActive,
      relief: Gtk.ReliefStyle.NONE,
      on_clicked: this.handleClicked,
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

exports.MountList = ({ activeUri, dispatch, panelId, mounts }) => (
  h('box', [
    mounts.names.map(x => mounts.entities[x]).map(mount => {
      return h(exports.Mount, {
        activeUri: activeUri,
        dispatch: dispatch,
        mount: mount,
        panelId: panelId,
        isActive: mounts.active[panelId] === mount.name,
        short: minLength(mounts.names, mount.name)
      })
    })
  ])
)

exports.mapStateToProps = (state, { panelId }) => ({
  activeUri: state.locations[panelId],
  mounts: state.mounts
})

exports.default = connect(exports.mapStateToProps)(exports.MountList)
