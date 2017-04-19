/* global imports */
const actions = require('../actions')
const { connect } = require('inferno-redux')
const { GICON, TEXT } = require('../utils/ListStore')
const formatSize = require('../utils/formatSize').default
const Gtk = imports.gi.Gtk
const h = require('inferno-hyperscript')
const minLength = require('../utils/minLength').default
const noop = require('lodash/noop')
const Select = require('../widgets/Select').default

exports.Mount = Mount
function Mount ({ free, mounts, name, onLevelUp, onMountChanged, size }) {
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
          on_changed: onMountChanged,
          value: name
        })
      ]),
      h('box', { border_width: 4, expand: true }, [
        h('label', { label: status })
      ]),
      h('v-separator'),
      h('box', [
        h('button', { relief: Gtk.ReliefStyle.NONE }, [
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
  const activeMount = state.mounts.entities[state.mounts.active[panelId]]
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
function mapDispatchToProps (dispatch, { panelId }) {
  return {
    onLevelUp: () => dispatch(actions.levelUp({ panelId: panelId })),
    onMountChanged: noop
  }
}

exports.default = connect(mapStateToProps, mapDispatchToProps)(Mount)
