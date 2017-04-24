/* global imports */
const actions = require('../actions')
const { connect } = require('inferno-redux')
const { GICON, TEXT } = require('../utils/ListStore')
const formatSize = require('../utils/formatSize').default
const getActiveMountUri = require('../selectors/getActiveMountUri').default
const GLib = imports.gi.GLib
const Gtk = imports.gi.Gtk
const h = require('inferno-hyperscript')
const minLength = require('../utils/minLength').default
const noop = require('lodash/noop')
const Select = require('../widgets/Select').default

exports.Mount = Mount
function Mount ({ free, mounts, name, onChanged, onFocus, onLayout, onLevelUp, onRoot, size }) {
  const status = '[' + name + '] ' +
    formatSize(free) + ' of ' +
    formatSize(size) + ' free'

  return (
    h('box', { expand: false }, [
      h('box', [
        h(Select, {
          cols: [
            { name: 'text', type: TEXT, pack: 'pack_end' },
            { name: 'icon', type: GICON }
          ],
          rows: mounts.names.map(x => mounts.entities[x]).map(mount => ({
            icon: {
              icon: mount.icon,
              iconType: mount.iconType
            },
            text: minLength(mounts.names, mount.name),
            value: mount.name
          })),
          on_changed: onChanged,
          on_layout: onLayout,
          on_focus: onFocus,
          value: name
        })
      ]),
      h('box', { border_width: 4, expand: true }, [
        h('label', { label: status })
      ]),
      h('v-separator'),
      h('box', [
        h('button', {
          on_clicked: onRoot,
          relief: Gtk.ReliefStyle.NONE
        }, [
          h('label', { label: '\\' })
        ]),
        h('button', {
          on_clicked: onLevelUp,
          relief: Gtk.ReliefStyle.NONE
        }, [
          h('label', { label: '..' })
        ])
      ])
    ])
  )
}

exports.mapStateToProps = mapStateToProps
function mapStateToProps (state, { panelId }) {
  const activeUri = getActiveMountUri(state, panelId)
  const activeMount = state.mounts.names.map(x => state.mounts.entities[x])
    .filter(mount => mount.rootUri === activeUri)[0]

  return {
    free: activeMount.attributes['filesystem::free'],
    name: activeMount.name,
    mounts: {
      names: state.mounts.names,
      entities: state.mounts.entities
    },
    size: activeMount.attributes['filesystem::size']
  }
}

exports.mapDispatchToProps = mapDispatchToProps
function mapDispatchToProps (dispatch, { panelId, refstore }) {
  return {
    onChanged: noop,
    onFocus: () => {
      setTimeout(() => {
        const node = refstore.get('panel' + panelId)

        if (node) {
          node.grab_focus()
        }
      }, 0)
    },
    onLayout: node => {
      refstore.set('mounts' + panelId)(node)
    },
    onLevelUp: () => dispatch(actions.levelUp({ panelId: panelId })),
    onRoot: () => dispatch(actions.root({ panelId: panelId }))
  }
}

exports.default = connect(mapStateToProps, mapDispatchToProps)(Mount)

exports.setTimeout = setTimeout
function setTimeout (callback, duration) {
  GLib.timeout_add(GLib.PRIORITY_DEFAULT, duration, callback, null)
}
