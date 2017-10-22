/* global imports */
const Gio = imports.gi.Gio
const Lang = imports.lang

/**
 * Let the user make a request and then another one to cancel it.
 */
exports.default = new Lang.Class({
  Name: 'GioCancellableAdapter',

  _init: function () {
    this._cancel = Lang.bind(this, this._cancel)
    this._create = Lang.bind(this, this._create)

    this.cancellables = {
      requestIds: [],
      entities: {}
    }
  },

  _create: function (requestId) {
    const cancellable = new Gio.Cancellable()

    this.cancellables.entities[requestId] = cancellable
    this.cancellables.requestIds.push(requestId)

    return cancellable
  },

  _cancel: function (requestId, callback) {
    const cancellable = this.cancellables.entities[requestId]
    cancellable.connect(callback)
    cancellable.cancel()

    this.cancellables.requestIds = this.cancellables.requestIds.filter(x => x !== requestId)
    delete this.cancellables.entities[requestId]
  }
})
