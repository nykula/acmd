/* global imports */
const Gtk = imports.gi.Gtk
const h = require('inferno-hyperscript')
const indexActions = require('../actions')
const Handler = require('../utils/Handler').default

const items = [
  { type: indexActions.REFRESH, icon_name: 'view-refresh', tooltip_text: 'Refresh' },
  'MODE',
  { control: 'TOGGLE', icon_name: 'format-justify-left', tooltip_text: 'List' },
  { control: 'TOGGLE', active: true, icon_name: 'format-justify-fill', tooltip_text: 'Table' },
  'HISTORY',
  { icon_name: 'go-previous', tooltip_text: 'Back' },
  { icon_name: 'go-next', tooltip_text: 'Forward' },
  'MISC',
  { icon_name: 'document-new', tooltip_text: 'Create file' },
  { control: 'TOGGLE', icon_name: 'dialog-warning', tooltip_text: 'Hidden files' }
]

exports.handlePressed = Handler(dispatch => type => () => {
  dispatch({ type: type })
})

exports.render = ({ dispatch }) => (
  h('box', [
    items.map(item => {
      if (typeof item === 'string') {
        return h('v-separator', { key: item })
      }
      return (
        h(item.control === 'TOGGLE' ? 'toggle-button' : 'button', {
          active: !!item.active,
          key: item.icon_name,
          relief: Gtk.ReliefStyle.NONE,
          on_pressed: exports.handlePressed(dispatch)(item.type),
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
