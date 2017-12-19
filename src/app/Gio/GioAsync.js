const { AsyncResult } = imports.gi.Gio;

/**
 * Calls an async method on a Gio object, given a Node-style callback.
 *
 * @param {(readyCallback: (_: any, result: AsyncResult) => void) => void} start
 * @param {(asyncResult: AsyncResult) => any} finish
 * @param {(error?: any, result?: any) => void} callback
 */
function GioAsync(start, finish, callback) {
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
}

exports.GioAsync = GioAsync;
