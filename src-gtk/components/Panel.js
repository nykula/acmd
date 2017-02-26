/* global imports */
const GLib = imports.gi.GLib
const Gtk = imports.gi.Gtk
const Pango = imports.gi.Pango
const h = require('virtual-dom/h')
const Hook = fun => Object.create({ hook: fun })
const hostSelect = require('../hooks/hostSelect').default
const hostTreeView = require('../hooks/hostTreeView').default

exports.renderVolume = ({ key, panelId, volumes, onLevelUp, onVolumeChanged }) => {
  return (
    h('box', { key: key, expand: false }, [
      h('box', {
        hook: hostSelect({
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
          on_clicked: onLevelUp,
          relief: Gtk.ReliefStyle.NONE
        }, [
          h('label', { label: '..' })
        ])
      ])
    ])
  )
}

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
      hook: exports.syncSelection(isActive)
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

exports.syncSelection = isActive => Hook(node => {
  node.selectionAttempt = 0

  GLib.timeout_add(GLib.PRIORITY_DEFAULT, 50, () => {
    const children = node.get_children()
    const isNotMounted = !node.parent || children.length === 0

    if (isNotMounted && node.selectionAttempt++ > 10) {
      return false
    }

    if (isNotMounted) {
      return true
    }

    if (isActive) {
      node.select_row(children[0])
    } else {
      node.unselect_row(children[0])
    }

    return true
  })
})

exports.renderDirectory = ({ key, files, selected, isActive }) => {
  return (
    h('scrolled-window', {
      key: key,
      expand: true,
      hscrollbar_policy: Gtk.PolicyType.NEVER,
      hook: hostTreeView({
        cols: [
          { title: null, name: 'icon', attribute: 'icon-name' },
          { title: 'Name', name: 'filename', attribute: 'text', expand: true },
          { title: 'Ext', name: 'ext', attribute: 'text', min_width: 40 },
          { title: 'Size', name: 'size', attribute: 'text', min_width: 45 },
          { title: 'Date', name: 'mtime', attribute: 'text', min_width: 110 },
          { title: 'Attr', name: 'mode', attribute: 'text', min_width: 40 }
        ],
        rows: files.map(exports.renderFile),
        selected: selected
      }),
      hook1: exports.syncFocus(isActive)
    })
  )
}

exports.syncFocus = isActive => Hook(node => {
  node.focusAttempt = 0

  GLib.timeout_add(GLib.PRIORITY_DEFAULT, 50, () => {
    const children = node.get_children()
    const isNotMounted = !node.parent || children.length === 0

    if (isNotMounted && node.focusAttempt++ > 10) {
      return false
    }

    if (isNotMounted) {
      return true
    }

    if (isActive) {
      children[0].grab_focus()
    }

    return true
  })
})

exports.renderFile = (file) => {
  let icon = 'text-x-generic'
  let filename = file.name
  let ext = ''

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
    const date = new Date(time)

    const month = ('00' + (date.getMonth() + 1)).slice(-2)
    const day = ('00' + (date.getDate())).slice(-2)
    const year = ('0000' + (date.getFullYear())).slice(-4)
    const hours = ('00' + (date.getHours())).slice(-2)
    const minutes = ('00' + (date.getMinutes())).slice(-2)

    return [month, day, year].join('/') + ' ' + [hours, minutes].join(':')
  })(file.modificationTime)

  return {
    icon: icon,
    filename: filename,
    ext: ext,
    size: file.fileType === 'DIRECTORY' ? '<DIR>' : file.size,
    mtime: mtime,
    mode: file.mode
  }
}

exports.renderStats = () => {
  return (
    h('box', { border_width: 4 }, [
      h('label', { label: '0 k / 43 k in 0 / 12 file(s)' })
    ])
  )
}

exports.render = (props) => {
  const id = props.id
  return (
    h('box', { orientation: Gtk.Orientation.VERTICAL }, [
      exports.renderVolume({
        key: 'VOLUME',
        panelId: id,
        volumes: props.volumes,
        onLevelUp: props.onLevelUp,
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
        key: 'DIRECTORY',
        isActive: props.isActive,
        files: props.files,
        selected: [props.activeFile]
      }),
      exports.renderStats({
        key: 'STATS'
      })
    ])
  )
}
