/* global imports */
const GLib = imports.gi.GLib
const Gtk = imports.gi.Gtk
const Pango = imports.gi.Pango
const actions = require('../actions')
const assign = require('lodash/assign')
const { connect } = require('inferno-redux')
const filesActions = require('../actions/files')
const h = require('inferno-hyperscript')
const Handler = require('../utils/Handler').default
const noop = require('lodash/noop')
const WidgetRef = require('../utils/WidgetRef').create
const SelectRef = WidgetRef(require('../widgets/Select').default)
const TreeViewRef = WidgetRef(require('../widgets/TreeView').default)

exports.renderVolume = ({ dispatch, key, panelId, volumes, onVolumeChanged }) => {
  return (
    h('box', { key: key, expand: false }, [
      h('box', {
        ref: SelectRef({
          value: volumes.active[panelId],
          options: volumes.labels.map(x => volumes.entities[x]).map(volume => ({
            value: volume.label,
            text: volume.label,
            icon: volume.icon_name + '-symbolic'
          })),
          on_changed: onVolumeChanged
        })
      }),
      h('box', { border_width: 4, expand: true }, [
        h('label', {
          label: '[files] 65,623,892 k of 628,600,828 k free'
        })
      ]),
      h('v-separator'),
      h('box', [
        h('button', { relief: Gtk.ReliefStyle.NONE }, [
          h('label', { label: '\\' })
        ]),
        h('button', {
          on_clicked: exports.handleLevelUp(dispatch)(panelId),
          relief: Gtk.ReliefStyle.NONE
        }, [
          h('label', { label: '..' })
        ])
      ])
    ])
  )
}

exports.handleLevelUp = Handler(dispatch => panelId => () => {
  dispatch(actions.levelUp({ panelId: panelId }))
})

exports.renderTabList = ({ key, tabs }) => {
  return (
    h('box', { key: key }, [
      tabs.ids.map(x => tabs.entities[x]).map(tab => {
        const active = tabs.active === tab.id
        return (
          h(active ? 'toggle-button' : 'button', {
            active: active,
            key: tab.id,
            relief: Gtk.ReliefStyle.NONE
          }, [
            h('box', { spacing: 4 }, [
              tab.icon ? (
                  h('image', {
                    icon_name: tab.icon + '-symbolic',
                    icon_size: Gtk.IconSize.SMALL_TOOLBAR
                  })
                ) : null,
              h('label', { label: tab.text })
            ])
          ])
        )
      })
    ])
  )
}

exports.renderLocation = ({ isActive, key, location }) => {
  const label = location.replace(/\/?$/, '/*')
  return (
    h('list-box', {
      key: key,
      ref: exports.syncSelection(isActive)
    }, [
      h('list-box-row', [
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

exports.syncSelection = isActive => node => {
  GLib.timeout_add(GLib.PRIORITY_DEFAULT, 0, () => {
    if (!node) {
      return
    }

    const children = node.get_children()

    if (isActive) {
      node.select_row(children[0])
    } else {
      node.unselect_row(children[0])
    }
  })
}

exports.renderDirectory = (props) => {
  const {
    activeFile,
    dispatch,
    key,
    files,
    isActive,
    panelId,
    sortedBy
  } = props

  return (
    h('scrolled-window', {
      key: key,
      expand: true,
      hscrollbar_policy: Gtk.PolicyType.NEVER,
      ref: node => {
        TreeViewRef({
          cols: [
            { title: null, name: 'icon', attribute: 'icon-name' },
            { title: 'Name', name: 'filename', attribute: 'text', expand: true },
            { title: 'Ext', name: 'ext', attribute: 'text', min_width: 50 },
            { title: 'Size', name: 'size', attribute: 'text', min_width: 55 },
            { title: 'Date', name: 'mtime', attribute: 'text', min_width: 125 },
            { title: 'Attr', name: 'mode', attribute: 'text', min_width: 45 }
          ].map(exports.prefixSort(sortedBy)),
          cursor: activeFile,
          on_activated: exports.handleActivated(dispatch)(panelId),
          on_clicked: exports.handleClicked(dispatch)(panelId),
          on_cursor: exports.handleCursor(dispatch)(panelId),
          on_selected: exports.handleSelected(dispatch)(panelId),
          rows: files.map(exports.renderFile),
          selected: [activeFile]
        })(node)
        exports.syncFocus(isActive)(node)
      }
    })
  )
}

exports.handleActivated = Handler(dispatch => panelId => index => {
  dispatch(filesActions.activated({ panelId: panelId, index: index }))
})

exports.handleClicked = Handler(dispatch => panelId => colName => {
  dispatch(filesActions.sorted({ panelId: panelId, by: colName }))
})

exports.handleCursor = Handler(dispatch => panelId => cursor => {
  dispatch(filesActions.cursor({ panelId: panelId, cursor: cursor }))
})

exports.handleSelected = Handler(dispatch => panelId => selected => {
  dispatch(filesActions.selected({ panelId: panelId, selected: selected }))
})

exports.prefixSort = sortedBy => col => {
  if (col.name === sortedBy) {
    return assign({}, col, { title: '↑' + col.title })
  }
  if ('-' + col.name === sortedBy) {
    return assign({}, col, { title: '↓' + col.title })
  }
  return col
}

exports.syncFocus = isActive => node => {
  GLib.timeout_add(GLib.PRIORITY_DEFAULT, 0, () => {
    if (!node) {
      return
    }

    const children = node.get_children()

    if (isActive) {
      children[0].grab_focus()
    }
  })
}

exports.renderFile = (file) => {
  let icon = 'text-x-generic'
  let filename = file.name
  let ext = ''
  let mode = ''

  const matches = /^(.+)\.(.*?)$/.exec(file.name)

  if (file.fileType !== 'DIRECTORY' && file.name !== '..' && matches) {
    filename = matches[1]
    ext = matches[2]
  }

  if (file.fileType === 'DIRECTORY') {
    icon = 'folder'
    filename = '[' + file.name + ']'
  }

  if (file.name === '..') {
    icon = 'go-up'
  }

  const mtime = ((time) => {
    const date = new Date(time * 1000)

    const month = ('00' + (date.getMonth() + 1)).slice(-2)
    const day = ('00' + (date.getDate())).slice(-2)
    const year = ('0000' + (date.getFullYear())).slice(-4)
    const hours = ('00' + (date.getHours())).slice(-2)
    const minutes = ('00' + (date.getMinutes())).slice(-2)

    return [month, day, year].join('/') + ' ' + [hours, minutes].join(':')
  })(file.modificationTime)

  if (file.attributes && file.attributes['unix::mode']) {
    mode = Number(file.attributes['unix::mode']).toString(8).slice(-4)
  }

  return {
    icon: icon,
    filename: filename,
    ext: ext,
    size: file.fileType === 'DIRECTORY' ? '<DIR>' : file.size,
    mtime: mtime,
    mode: mode
  }
}

exports.renderStats = () => {
  return (
    h('box', { border_width: 4 }, [
      h('label', { label: '0 k / 43 k in 0 / 12 file(s)' })
    ])
  )
}

exports.Panel = (props) => {
  const id = props.id
  return (
    h('box', { orientation: Gtk.Orientation.VERTICAL }, [
      exports.renderVolume({
        dispatch: props.dispatch,
        key: 'VOLUME',
        panelId: id,
        volumes: props.volumes,
        onVolumeChanged: props.onVolumeChanged
      }),
      exports.renderTabList({
        key: 'TAB_LIST',
        tabs: props.tabs
      }),
      h('h-separator'),
      exports.renderLocation({
        key: 'LOCATION',
        isActive: props.isActive,
        location: props.location
      }),
      h('h-separator'),
      exports.renderDirectory({
        activeFile: props.activeFile,
        dispatch: props.dispatch,
        key: 'DIRECTORY',
        isActive: props.isActive,
        files: props.files,
        panelId: id,
        sortedBy: props.sortedBy
      }),
      exports.renderStats({
        key: 'STATS'
      })
    ])
  )
}

exports.mapStateToProps = (state, { id }) => ({
  activeFile: state.files.active[id],
  files: state.files.byPanel[id],
  isActive: state.panels.active === id,
  location: state.locations[id],
  onVolumeChanged: noop,
  sortedBy: state.files.sortedBy[id],
  tabs: state.tabs[id],
  volumes: state.volumes
})

exports.mapDispatchToProps = dispatch => ({
  dispatch: dispatch,
  onVolumeChanged: noop
})

exports.default = connect(
  exports.mapStateToProps,
  exports.mapDispatchToProps
)(exports.Panel)
