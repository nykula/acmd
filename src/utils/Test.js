#!/usr/bin/gjs
/* global log */

const Buffer = require('buffer/').Buffer
const create = require('virtual-dom/create-element')
const expect = require('expect')
const GtkDom = require('./GtkDom')

/**
 * Renders a tree and inserts it into a one-off application.
 */
exports.smoke = function (tree) {
  GtkDom.app({
    on_startup: ({ app, win }) => {
      win.add(create(tree))
    },

    on_activate: ({ win }) => {
      win.show_all()
      win.destroy()
    }
  }).run([])
}

exports.it = function (title, callback) {
  log(title + ' STARTED')
  callback()
  log(title + ' SUCCESS')
}

/**
 * Sets up the environment for tests.
 */
exports.require = () => {
  window.Buffer = Buffer
  window.expect = expect
  window.it = exports.it
  window.smoke = exports.smoke
}
