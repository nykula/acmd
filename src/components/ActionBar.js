/* global imports */
const { connect } = require('inferno-redux')
const indexActions = require('../actions')
const Gtk = imports.gi.Gtk
const h = require('inferno-hyperscript')

const actions = [
  { type: indexActions.VIEW, text: 'View', shortcut: 'F3' },
  { type: indexActions.EDITOR, text: 'Edit', shortcut: 'F4' },
  { type: indexActions.CP, text: 'Copy', shortcut: 'F5' },
  { type: indexActions.MV, text: 'Move', shortcut: 'F6' },
  { type: indexActions.MKDIR, text: 'NewFolder', shortcut: 'F7' },
  { type: indexActions.RM, text: 'Delete', shortcut: 'F8' },
  { type: indexActions.EXIT, text: 'Exit', shortcut: 'Alt+F4' }
]

exports.ActionBar = ({ handlePressed }) => {
  return (
    h('box', { expand: false }, [
      actions.map(action => [
        h('button', {
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

exports.default = connect(null, exports.mapDispatchToProps)(exports.ActionBar)
