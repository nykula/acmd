/* global imports */
const Gtk = imports.gi.Gtk
const Component = require('inferno-component').default
const h = require('inferno-hyperscript').default
const { connect } = require('inferno-mobx')
const noop = require('lodash/noop')
const { ActionService } = require('../Action/ActionService')
const autoBind = require('../Gjs/autoBind').default
const { setTimeout } = require('../Gjs/setTimeout')
const { GICON, TEXT } = require('../ListStore/ListStore')
const minLength = require('../MinLength/minLength').default
const { MountService } = require('../Mount/MountService')
const getActiveMountUri = require('../Mount/getActiveMountUri').default
const { PanelService } = require('../Panel/PanelService')
const Refstore = require('../Refstore/Refstore').default
const Select = require('../Select/Select').default
const formatSize = require('../Size/formatSize').default
const { TabService } = require('../Tab/TabService')

/**
 * @typedef IProps
 * @property {ActionService} actionService
 * @property {MountService} mountService
 * @property {number} panelId
 * @property {PanelService} panelService
 * @property {Refstore} refstore
 * @property {TabService} tabService
 *
 * @param {IProps} props
 */
function Mount (props) {
  Component.call(this, props)
  autoBind(this, Mount.prototype)
}

Mount.prototype = Object.create(Component.prototype)

/**
 * @type {IProps}
 */
Mount.prototype.props = undefined

Mount.prototype.onChanged = noop

Mount.prototype.handleFocus = function () {
  setTimeout(() => {
    const node = this.props.refstore.get('panel' + this.props.panelId)

    if (node) {
      node.grab_focus()
    }
  }, 0)
}

Mount.prototype.handleLayout = function (node) {
  this.props.refstore.set('mounts' + this.props.panelId)(node)
}

Mount.prototype.handleLevelUp = function () {
  this.props.actionService.levelUp(this.props.panelId)
}

Mount.prototype.handleRoot = function () {
  this.props.actionService.root(this.props.panelId)
}

Mount.prototype.render = function () {
  const activeUri = getActiveMountUri(this.props, this.props.panelId)

  const { entities, names } = this.props.mountService

  const activeMount = names.map(x => entities[x])
    .filter(mount => mount.rootUri === activeUri)[0]

  const free = activeMount.attributes['filesystem::free']
  const name = activeMount.name
  const size = activeMount.attributes['filesystem::size']

  const status = '[' + name + '] ' +
    formatSize(free) + ' of ' +
    formatSize(size) + ' free'

  return (
    h('box', { expand: false }, [
      h('box', [
        h(Select, {
          cols: [
            { name: 'text', type: TEXT, pack: 'pack_end' },
            { name: 'icon', type: GICON }
          ],
          rows: names.map(x => entities[x]).map(mount => ({
            icon: {
              icon: mount.icon,
              iconType: mount.iconType
            },
            text: minLength(names, mount.name),
            value: mount.name
          })),
          on_changed: this.onChanged,
          on_layout: this.handleLayout,
          on_focus: this.handleFocus,
          value: name
        })
      ]),
      h('box', { border_width: 4, expand: true }, [
        h('label', { label: status })
      ]),
      h('v-separator'),
      h('box', [
        h('button', {
          on_clicked: this.handleRoot,
          relief: Gtk.ReliefStyle.NONE
        }, [
          h('label', { label: '\\' })
        ]),
        h('button', {
          on_clicked: this.handleLevelUp,
          relief: Gtk.ReliefStyle.NONE
        }, [
          h('label', { label: '..' })
        ])
      ])
    ])
  )
}

exports.default = connect([
  'actionService',
  'mountService',
  'panelService',
  'refstore',
  'tabService'
])(Mount)
