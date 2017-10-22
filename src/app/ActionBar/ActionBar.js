/* global imports */
const { connect } = require('inferno-redux')
const Action = require('../Action/Action')
const Gtk = imports.gi.Gtk
const h = require('inferno-hyperscript')

const actions = [
  { type: Action.VIEW, text: 'View', shortcut: 'F3' },
  { type: Action.EDITOR, text: 'Edit', shortcut: 'F4' },
  { type: Action.CP, text: 'Copy', shortcut: 'F5' },
  { type: Action.MV, text: 'Move', shortcut: 'F6' },
  { type: Action.MKDIR, text: 'NewFolder', shortcut: 'F7' },
  { type: Action.RM, text: 'Delete', shortcut: 'F8' },
  { type: Action.EXIT, text: 'Exit', shortcut: 'Alt+F4' }
]

exports.ActionBar = ({ handlePressed }) => {
  return (
    h('box', { expand: false }, [
      actions.map(action => [
        h('button', {
          can_focus: false,
          expand: true,
          key: action.type,
          label: action.shortcut + ' ' + action.text,
          on_pressed: handlePressed(action.type),
          relief: Gtk.ReliefStyle.NONE
        }),
        h('v-separator', { key: action.type + '+' })
      ])
    ])
  )
}

exports.mapDispatchToProps = dispatch => ({
  handlePressed: type => () => {
    dispatch({ type: type })
  }
})

exports.default = connect(undefined, exports.mapDispatchToProps)(exports.ActionBar)
