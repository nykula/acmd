/* global imports */
const Gtk = imports.gi.Gtk
const h = require('virtual-dom/h')

const items = [
  { icon_name: 'view-refresh', tooltip_text: 'Refresh' },
  'MODE',
  { type: 'TOGGLE', icon_name: 'format-justify-left', tooltip_text: 'List' },
  { type: 'TOGGLE', active: true, icon_name: 'format-justify-fill', tooltip_text: 'Table' },
  'HISTORY',
  { icon_name: 'go-previous', tooltip_text: 'Back' },
  { icon_name: 'go-next', tooltip_text: 'Forward' },
  'MISC',
  { icon_name: 'document-new', tooltip_text: 'Create file' },
  { type: 'TOGGLE', icon_name: 'dialog-warning', tooltip_text: 'Hidden files' }
]

exports.render = () => (
  h('box', [
    items.map(item => {
      if (typeof item === 'string') {
        return h('v-separator', { key: item })
      }
      return (
        h(item.type === 'TOGGLE' ? 'toggle-button' : 'button', {
          active: !!item.active,
          key: item.icon_name,
          relief: Gtk.ReliefStyle.NONE,
          tooltip_text: item.tooltip_text
        }, [
          h('image', {
            icon_name: item.icon_name + '-symbolic',
            icon_size: Gtk.IconSize.SMALL_TOOLBAR
          })
        ])
      )
    })
  ])
)
