/* global imports */
const assign = require('lodash/assign')
const autoBind = require('../Gjs/autoBind').default
/** @type {*} */ const bindActionCreators = require('redux').bindActionCreators
const Component = require('inferno-component')
const { connect } = require('inferno-redux')
const FileAction = require('../File/FileAction')
const formatSize = require('../Size/formatSize').default
const Action = require('../Action/Action')
const getVisibleFiles = require('../Action/getVisibleFiles').default
const { GICON, TEXT } = require('../ListStore/ListStore')
const Gdk = imports.gi.Gdk
const Gtk = imports.gi.Gtk
const h = require('inferno-hyperscript')
const PanelAction = require('../Panel/PanelAction')
const TabAction = require('../Tab/TabAction')
const TreeView = require('../TreeView/TreeView').default

/**
 * @typedef {Object} IProps
 * @property {any=} actions
 * @property {number=} cursor
 * @property {boolean=} isActive
 * @property {number=} panelId
 * @property {any=} refstore
 * @property {any=} rows
 * @property {number=} selected
 * @property {string=} sortedBy
 * @property {number=} tabId
 *
 * @param {IProps} props
 */
function Directory (props) {
  Component.call(this, props)
  autoBind(this, Directory.prototype)
}

Directory.prototype = Object.create(Component.prototype)

/** @type {*} */
Directory.prototype.container = undefined

/** @type {IProps} */
Directory.prototype.props = undefined

Directory.prototype.componentDidUpdate = function (prevProps) {
  if (prevProps.isActive !== this.props.isActive) {
    this.focusIfActive()
  }
}

Directory.prototype.focusIfActive = function () {
  if (this.props.isActive) {
    const children = this.container.get_children()
    children[0].grab_focus()
  }
}

Directory.prototype.handleActivated = function (index) {
  this.props.actions.files.activated({
    index: index,
    panelId: this.props.panelId,
    tabId: this.props.tabId
  })
}

Directory.prototype.handleClicked = function (colName) {
  this.props.actions.files.sorted({
    by: colName,
    tabId: this.props.tabId
  })
}

Directory.prototype.handleCursor = function (cursor) {
  this.props.actions.files.cursor({
    cursor: cursor,
    panelId: this.props.panelId,
    tabId: this.props.tabId
  })
}

Directory.prototype.handleKeyPressEvent = function (ev) {
  const { actions, panelId, tabId } = this.props

  switch (ev.which) {
    case Gdk.KEY_BackSpace:
      actions.index.levelUp({ panelId: panelId })
      break

    case Gdk.KEY_ISO_Left_Tab:
    case Gdk.KEY_Tab:
      if (ev.ctrlKey && ev.shiftKey) {
        actions.tabs.prev(panelId)
      } else if (ev.ctrlKey) {
        actions.tabs.next(panelId)
      } else {
        actions.panels.toggledActive()
      }
      return true

    case Gdk.KEY_1:
      if (ev.altKey) {
        actions.index.mounts(0)
        return true
      }
      break

    case Gdk.KEY_2:
      if (ev.altKey) {
        actions.index.mounts(1)
        return true
      }
      break

    case Gdk.KEY_F2:
      actions.index.refresh()
      break

    case Gdk.KEY_F3:
      actions.index.view()
      break

    case Gdk.KEY_F4:
      actions.index.editor()
      break

    case Gdk.KEY_F5:
      actions.index.cp()
      break

    case Gdk.KEY_F6:
      actions.index.mv()
      break

    case Gdk.KEY_F7:
      actions.index.mkdir()
      break

    case Gdk.KEY_F8:
      actions.index.rm()
      break

    case Gdk.KEY_b:
      if (ev.ctrlKey) {
        actions.index.showHidSys()
      }
      break

    case Gdk.KEY_l:
      if (ev.ctrlKey) {
        actions.index.ls()
      }
      break

    case Gdk.KEY_t:
      if (ev.ctrlKey) {
        actions.tabs.create(panelId)
      }
      break

    case Gdk.KEY_w:
      if (ev.ctrlKey) {
        actions.tabs.remove(tabId)
      }
      break
  }

  return false
}

Directory.prototype.handleLayout = function (node) {
  this.props.refstore.set('panel' + this.props.panelId)(node)
  this.focusIfActive()
}

Directory.prototype.handleSearch = function (store, _col, input, iter) {
  const skip = this.props.rows.map(({ filename, ext, size }) => {
    const isDir = size === '<DIR>'
    let name = filename

    if (isDir) {
      name = name.slice(1, -1)
    }

    if (ext) {
      name += '.' + ext
    }

    return name.toLowerCase().indexOf(input.toLowerCase()) !== 0
  })

  const index = Number(store.get_string_from_iter(iter))

  if (skip.indexOf(false) === -1 && index === this.props.cursor) {
    return false
  }

  return skip[index]
}

Directory.prototype.handleSelected = function (selected) {
  this.props.actions.files.selected({
    panelId: this.props.panelId,
    selected: selected,
    tabId: this.props.tabId
  })
}

Directory.prototype.prefixSort = function (col) {
  const sortedBy = this.props.sortedBy
  if (col.name === sortedBy) {
    return assign({}, col, { title: '↑' + col.title })
  }
  if ('-' + col.name === sortedBy) {
    return assign({}, col, { title: '↓' + col.title })
  }
  return col
}

Directory.prototype.refContainer = function (node) {
  this.container = node
}

Directory.prototype.render = function () {
  const { cursor, rows, selected } = this.props

  return (
    h('scrolled-window', {
      expand: true,
      hscrollbar_policy: Gtk.PolicyType.NEVER,
      ref: this.refContainer
    }, [
      h(TreeView, {
        cols: [
            { title: null, name: 'icon', type: GICON },
            { title: 'Name', name: 'filename', type: TEXT, expand: true },
            { title: 'Ext', name: 'ext', type: TEXT, min_width: 50 },
            { title: 'Size', name: 'size', type: TEXT, min_width: 55 },
            { title: 'Date', name: 'mtime', type: TEXT, min_width: 125 },
            { title: 'Attr', name: 'mode', type: TEXT, min_width: 45 }
        ].map(this.prefixSort),
        cursor: cursor,
        on_activated: this.handleActivated,
        on_clicked: this.handleClicked,
        on_cursor: this.handleCursor,
        on_key_press_event: this.handleKeyPressEvent,
        on_layout: this.handleLayout,
        on_selected: this.handleSelected,
        on_search: this.handleSearch,
        rows: rows,
        selected: selected
      })
    ])
  )
}
exports.Directory = Directory

exports.mapFileToRow = mapFileToRow
function mapFileToRow (file) {
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
    size: file.fileType === 'DIRECTORY' ? '<DIR>' : formatSize(file.size),
    mtime: mtime,
    mode: mode
  }
}

exports.mapStateToProps = mapStateToProps
function mapStateToProps (state, { panelId }) {
  const tabId = state.panels[panelId].activeTabId

  return {
    cursor: state.tabs[tabId].cursor,

    isActive: state.activePanelId === panelId,

    rows: getVisibleFiles({
      files: state.tabs[tabId].files,
      showHidSys: state.showHidSys
    }).map(mapFileToRow),

    selected: state.tabs[tabId].selected,

    sortedBy: state.tabs[tabId].sortedBy,

    tabId: tabId
  }
}

exports.mapDispatchToProps = mapDispatchToProps
function mapDispatchToProps (dispatch) {
  return {
    actions: {
      files: bindActionCreators(FileAction, dispatch),
      index: bindActionCreators(Action, dispatch),
      panels: bindActionCreators(PanelAction, dispatch),
      tabs: bindActionCreators(TabAction, dispatch)
    }
  }
}

exports.default = connect(mapStateToProps, mapDispatchToProps)(Directory)
