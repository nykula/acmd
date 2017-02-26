/* global imports */
const Gtk = imports.gi.Gtk
const h = require('virtual-dom/h')

const actions = [
  { type: 'VIEW', text: 'View', shortcut: 'F3' },
  { type: 'EDITOR', text: 'Edit', shortcut: 'F4' },
  { type: 'CP', text: 'Copy', shortcut: 'F5' },
  { type: 'MV', text: 'Move', shortcut: 'F6' },
  { type: 'MKDIR', text: 'NewFolder', shortcut: 'F7' },
  { type: 'RM', text: 'Delete', shortcut: 'F8' },
  { type: 'Exit', text: 'Exit', shortcut: 'Alt+F4' }
]

exports.render = () => {
  return (
    h('box', { expand: false }, [
      actions.map(action => [
        h('button', {
          expand: true,
          key: action.type,
          label: action.shortcut + ' ' + action.text,
          relief: Gtk.ReliefStyle.NONE
        }),
        h('v-separator', { key: action.type + '+' })
      ])
    ])
  )
}
