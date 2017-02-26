/* global imports */
const Pango = imports.gi.Pango
const h = require('virtual-dom/h')

exports.render = ({ location }) => {
  return (
        h('box', { expand: false }, [
          h('box', { border_width: 4 }),
          h('label', {
            ellipsize: Pango.EllipsizeMode.MIDDLE,
            label: location + '>'
          }),
          h('box', { border_width: 4 }),
          h('entry', { expand: true })
        ])
  )
}
