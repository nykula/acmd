/* global it */
const { app } = require('../Gjs/GtkDom')
const expect = require('expect')
const Component = require('inferno-component').default
const h = require('inferno-hyperscript').default
const Refstore = require('./Refstore').default
const { render } = require('inferno')

it('stores reference', () => {
  const refstore = new Refstore()
  const node = {}
  refstore.set('panel0DirTree')(node)
  expect(refstore.get('panel0DirTree')).toBe(node)
})

it('returns same setter for same key', () => {
  const refstore = new Refstore()
  const setter = refstore.set('panel1DirTree')
  expect(refstore.set('panel1DirTree')).toBe(setter)
  expect(refstore.set('panel0DirTree')).toNotBe(setter)
})

it('sets ref in one component, gets in another', () => {
  function App (props) {
    Component.call(this, props)
    this.refstore = new Refstore()
  }

  App.prototype = Object.create(Component.prototype)

  App.prototype.render = function () {
    return h('v-box', [
      h('h-box', [
        h(Panel, { onDirTreeRef: this.refstore.set('panel0DirTree') }),
        h(Panel, { onDirTreeRef: this.refstore.set('panel1DirTree') })
      ]),
      h(Action, { refstore: this.refstore })
    ])
  }

  function Panel ({ onDirTreeRef }) {
    return h('h-box', [
      h(Dir, { onTreeRef: onDirTreeRef })
    ])
  }

  function Dir ({ onTreeRef }) {
    return h('h-box', [
      h('entry', { ref: onTreeRef })
    ])
  }

  function Action (props) {
    Component.call(this, props)
  }

  Action.prototype = Object.create(Component.prototype)

  Action.prototype.componentDidMount = function () {
    this.props.refstore.get('panel1DirTree').grab_focus()
  }

  Action.prototype.render = function () {
    return h('box')
  }

  app({
    on_startup: ({ app, win }) => {
      render(h(App), win)
    },

    on_activate: ({ app, win }) => {
      win.set_keep_above(true)
      app.quit()
    }
  }).run([])
})
