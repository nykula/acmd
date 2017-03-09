/* global imports */
/* eslint-disable no-new-func */
const Pango = imports.gi.Pango
const h = require('inferno-hyperscript')
const Handler = require('../utils/Handler').default

exports.handleActivate = Handler(dispatch => () => node => {
  if (node.text) {
    dispatch(new Function('return ' + node.text)())
  }
})

exports.render = ({ dispatch, location }) => {
  return (
    h('box', { expand: false }, [
      h('box', { border_width: 4 }),
      h('label', {
        ellipsize: Pango.EllipsizeMode.MIDDLE,
        label: location + '>'
      }),
      h('box', { border_width: 4 }),
      h('entry', { expand: true, on_activate: exports.handleActivate(dispatch)() })
    ])
  )
}
