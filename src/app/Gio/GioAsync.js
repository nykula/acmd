const { AsyncResult } = imports.gi.Gio;

/**
 * Calls an async method on a Gio object.
 *
 * @param {any} obj
 * @param {string} methodName
 */
function GioAsync(obj, methodName) {
  const args = [];
  const callback = arguments[arguments.length - 1];

  for (let i = 2; i < arguments.length - 1; i++) {
    args.push(arguments[i]);
  }

  args.push(function(/** @type {any} */ _, /** @type {any} */ asyncResult) {
    let result;

    try {
      result = obj[methodName + "_finish"](asyncResult);
    } catch (error) {
      callback(error);
      return;
    }

    callback(null, result);
  });

  obj[methodName + "_async"].apply(obj, args);
}

/**
 * @static
 * @param {(readyCallback: (_: any, result: AsyncResult) => void) => void} start
 * @param {(asyncResult: AsyncResult) => any} finish
 * @param {(error?: any, result?: any) => void} callback
 */
GioAsync.ReadyCallback = (start, finish, callback) => {
  start((_, asyncResult) => {
    let result;

    try {
      result = finish(asyncResult);
    } catch (error) {
      callback(error);
      return;
    }

    callback(undefined, result);
  });
};

exports.GioAsync = GioAsync;
