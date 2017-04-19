/* global imports */
const actions = require('../actions')
const Component = require('inferno-component')
const { connect } = require('inferno-redux')
const getActiveMountUri = require('../selectors/getActiveMountUri').default
const Gtk = imports.gi.Gtk
const h = require('inferno-hyperscript')
const Icon = require('../utils/Icon').default
const minLength = require('../utils/minLength').default

exports.Mount = Mount
function Mount (props) {
  Component.call(this, props)
  this.handleClicked = this.handleClicked.bind(this)
}

Mount.prototype = Object.create(Component.prototype)

Mount.prototype.handleClicked = function () {
  const { activeUri, dispatch, location, mount } = this.props
  const isActive = mount.rootUri === activeUri

  const menu = new Gtk.Menu()
  let item

  if (mount.rootUri && mount.rootUri !== location) {
    item = new Gtk.MenuItem()
    item.label = 'Open'
    item.connect('activate', () => {
      dispatch(actions.ls(this.props.panelId, mount.rootUri))
    })
    menu.add(item)
  }

  if (mount.rootUri && !isActive) {
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

Mount.prototype.render = function () {
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

exports.MountList = MountList
function MountList ({ activeUri, dispatch, location, panelId, mounts }) {
  return (
    h('box', [
      mounts.names.map(x => mounts.entities[x]).map(mount => {
        return h(Mount, {
          dispatch: dispatch,
          location: location,
          mount: mount,
          panelId: panelId,
          isActive: activeUri === mount.rootUri,
          short: minLength(mounts.names, mount.name)
        })
      })
    ])
  )
}

exports.mapStateToProps = mapStateToProps
function mapStateToProps (state, { panelId }) {
  return {
    activeUri: getActiveMountUri(state, panelId),
    location: state.entities.tabs[panelId].location,
    mounts: state.mounts
  }
}

exports.default = connect(mapStateToProps)(MountList)
