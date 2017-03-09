/* global expect, imports, it */
const Component = require('inferno-component')
const h = require('inferno-hyperscript')
const isEqual = require('lodash/isEqual')
const noop = require('lodash/noop')
const { render } = require('inferno')
const WidgetRef = require('./WidgetRef').create

// widgets/Foobar.js

function isVeryDifferent (x, y) {
  return x.on_clicked !== y.on_clicked
}

function Foobar (props) {
  this.props = props
}

Foobar.prototype.type = 'Widget'

Foobar.prototype.name = 'Foobar'

Foobar.prototype.init = function () {
  const node = new imports.gi.Gtk.Button()
  node.widget = this
  node.label = this.props.label
  node.connect('clicked', function () {
    node.widget.props.on_clicked()
  })
  return node
}

Foobar.prototype.update = function (prev, node) {
  if (isEqual(this.props, prev.props)) {
    return null
  }
  if (isVeryDifferent(this.props, prev.props)) {
    return this.init()
  }
  node.label = this.props.label
  return null
}

Foobar.prototype.destroy = noop

// components/FoobarContainer.js

const FoobarRef = WidgetRef(Foobar)

function FoobarBox () {
  Component.call(this)
  this.handleClicked = this.handleClicked.bind(this)
  this.state = { label: 'Start' }
}

FoobarBox.prototype = Object.create(Component.prototype)

FoobarBox.prototype.handleClicked = function () {
  this.setState({ label: 'Stop' })
}

FoobarBox.prototype.render = function () {
  return h('box', {
    border_width: 10,
    ref: FoobarRef({
      label: this.state.label,
      on_clicked: this.handleClicked
    })
  })
}

// widgets/Foobar.test.js

const getBtn = win => win.get_children()[0].get_children()[0]
let instance

require('./GtkDom').app({
  on_startup: ({ app, win }) => {
    it('renders without crashing', () => {
      const tree = h(FoobarBox, {
        ref: _instance => { instance = _instance }
      })
      render(tree, win)
    })
  },

  on_activate: ({ win }) => {
    win.show_all()

    it('keeps node if no props changed', () => {
      const btn = getBtn(win)
      instance.forceUpdate()
      const _btn = getBtn(win)
      expect(btn).toBe(_btn)
    })

    it('updates node on minor props change', () => {
      const btn = getBtn(win)
      const label = btn.label
      btn.clicked()
      const _btn = getBtn(win)
      const _label = _btn.label
      expect(btn).toBe(_btn)
      expect(label).toNotBe(_label)
    })

    it('replaces node on major props change', () => {
      const btn = win.get_children()[0].get_children()[0]
      instance.handleClicked = noop
      instance.forceUpdate()
      const _btn = win.get_children()[0].get_children()[0]
      expect(btn).toNotBe(_btn)
    })

    win.destroy()
  }
}).run([])
