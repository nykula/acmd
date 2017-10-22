const Gio = imports.gi.Gio;
const Lang = imports.lang;

/**
 * Let the user make a request and then another one to cancel it.
 */
function GioCancellable() {
  this._cancel = this._cancel.bind(this);
  this._create = this._cancel.bind(this);

  this.cancellables = {
    requestIds: [],
    entities: {},
  };
}

/**
 * @param {number} requestId
 */
GioCancellable.prototype._create = function(requestId) {
  const cancellable = new Gio.Cancellable();

  this.cancellables.entities[requestId] = cancellable;
  this.cancellables.requestIds.push(requestId);

  return cancellable;
};

/**
 * @param {number} requestId
 * @param {Function} callback
 */
GioCancellable.prototype._cancel = function(requestId, callback) {
  const cancellable = this.cancellables.entities[requestId];
  cancellable.connect(callback);
  cancellable.cancel();

  this.cancellables.requestIds = this.cancellables.requestIds.filter(x => x !== requestId);
  delete this.cancellables.entities[requestId];
};

exports.default = GioCancellable;
