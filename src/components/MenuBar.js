const h = require('inferno-hyperscript')

const menus = [
  { label: 'Files' },
  { label: 'Mark' },
  { label: 'Commands' },
  { label: 'Net' },
  { label: 'Show' },
  { label: 'Configuration' },
  { label: 'Start' }
]

exports.render = () => (
  h('menu-bar', [
    menus.map(x => (
      h('menu-item', { key: x.label, label: x.label })
    ))
  ])
)
