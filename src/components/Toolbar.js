/* global imports */
const { connect } = require('inferno-redux')
const Gtk = imports.gi.Gtk
const h = require('inferno-hyperscript')
const indexActions = require('../actions')
const ToggleButton = require('./ToggleButton').default

exports.Toolbar = ({ handlePressed, showHidSys }) => {
  const items = [
    { type: indexActions.REFRESH, icon_name: 'view-refresh', tooltip_text: 'Refresh' },
    'MODE',
    { sensitive: false, icon_name: 'format-justify-left', tooltip_text: 'List' },
    { active: true, icon_name: 'format-justify-fill', tooltip_text: 'Table' },
    'HISTORY',
    { type: indexActions.BACK, icon_name: 'go-previous', tooltip_text: 'Back' },
    { type: indexActions.FORWARD, icon_name: 'go-next', tooltip_text: 'Forward' },
    'MISC',
    { type: indexActions.LS, icon_name: 'go-jump', tooltip_text: 'Go to URI' },
    { type: indexActions.TOUCH, icon_name: 'document-new', tooltip_text: 'Create file' },
    { type: indexActions.TERMINAL, icon_name: 'utilities-terminal', tooltip_text: 'Terminal' },
    {
      active: showHidSys,
      icon_name: 'dialog-warning',
      tooltip_text: 'Hidden files',
      type: indexActions.SHOW_HID_SYS
    }
  ]

  return (
    h('box', [
      items.map(item => {
        if (typeof item === 'string') {
          return h('v-separator', { key: item })
        }
        return (
          h(ToggleButton, {
            active: !!item.active,
            can_focus: false,
            key: item.icon_name,
            relief: Gtk.ReliefStyle.NONE,
            on_pressed: 'type' in item ? handlePressed(item.type) : null,
            sensitive: 'sensitive' in item ? item.sensitive : null,
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
}

exports.mapStateToProps = state => ({
  showHidSys: state.showHidSys
})

exports.mapDispatchToProps = dispatch => ({
  handlePressed: type => () => {
    dispatch({ type: type })
  }
})

exports.default = connect(exports.mapStateToProps, exports.mapDispatchToProps)(exports.Toolbar)
