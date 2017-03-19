/* global imports */
const GLib = imports.gi.GLib
const Gtk = imports.gi.Gtk
const Pango = imports.gi.Pango
const actions = require('../actions')
const assign = require('lodash/assign')
const { connect } = require('inferno-redux')
const filesActions = require('../actions/files')
const getVisibleFiles = require('../selectors/getVisibleFiles').default
const h = require('inferno-hyperscript')
const Handler = require('../utils/Handler').default
const minLength = require('../utils/minLength').default
const noop = require('lodash/noop')
const Select = require('../widgets/Select').default
const TreeView = require('../widgets/TreeView').default

exports.renderMount = ({ dispatch, key, panelId, mounts, onMountChanged }) => {
  const activeMount = mounts.entities[mounts.active[panelId]]

  const free = activeMount.attributes['filesystem::free'] / 1000
  const size = activeMount.attributes['filesystem::size'] / 1000

  const status = '[' + activeMount.name + '] ' +
    Math.floor(free || 0).toLocaleString() + ' of ' +
    Math.floor(size || 0).toLocaleString() + ' k free'

  return (
    h('box', { key: key, expand: false }, [
      h('box', [
        h(Select, {
          cols: [
            { name: 'text', attribute: 'text', pack: 'pack_end' },
            { name: 'icon', attribute: 'gicon' }
          ],
          rows: mounts.names.map(x => mounts.entities[x]).map(mount => ({
            icon: {
              icon: mount.icon,
              iconType: mount.iconType
            },
            value: mount.name,
            text: minLength(mounts.names, mount.name)
          })),
          value: mounts.active[panelId],
          on_changed: onMountChanged
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
  const label = location.replace(/\/?$/, '/*').replace(/^file:\/\//, '')
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
    showHidSys,
    sortedBy
  } = props

  return (
    h('scrolled-window', {
      key: key,
      expand: true,
      hscrollbar_policy: Gtk.PolicyType.NEVER,
      ref: exports.syncFocus(isActive)
    }, [
      h(TreeView, {
        cols: [
          { title: null, name: 'icon', attribute: 'gicon' },
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
        on_search: exports.handleSearch,
        rows: getVisibleFiles({
          files: files,
          showHidSys: showHidSys
        }).map(exports.renderFile),
        selected: [activeFile]
      })
    ])
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

exports.handleSearch = (store, col, input, iter) => {
  const filename = store.get_value(iter, col)
  const ext = store.get_value(iter, col + 1)
  const isDir = store.get_value(iter, col + 2) === '<DIR>'
  let name = filename

  if (isDir) {
    name = name.slice(1, -1)
  }

  if (ext) {
    name += '.' + ext
  }

  return name.toLowerCase().indexOf(input.toLowerCase()) !== 0
}

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
  let { icon, iconType } = file
  let filename = file.name
  let ext = ''
  let mode = ''

  const matches = /^(.+)\.(.*?)$/.exec(file.name)

  if (file.fileType !== 'DIRECTORY' && file.name !== '..' && matches) {
    filename = matches[1]
    ext = matches[2]
  }

  if (file.fileType === 'DIRECTORY') {
    filename = '[' + file.name + ']'
  }

  if (file.name === '..') {
    icon = 'go-up'
    iconType = 'ICON_NAME'
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
    icon: { icon: icon, iconType: iconType },
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
      exports.renderMount({
        dispatch: props.dispatch,
        key: 'MOUNT',
        panelId: id,
        mounts: props.mounts,
        onMountChanged: props.onMountChanged
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
        showHidSys: props.showHidSys,
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
  onMountChanged: noop,
  showHidSys: state.files.showHidSys,
  sortedBy: state.files.sortedBy[id],
  tabs: state.tabs[id],
  mounts: state.mounts
})

exports.mapDispatchToProps = dispatch => ({
  dispatch: dispatch,
  onMountChanged: noop
})

exports.default = connect(
  exports.mapStateToProps,
  exports.mapDispatchToProps
)(exports.Panel)
