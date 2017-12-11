/**
 * Calls an async method on a Gio object.
 *
 * @param {any} obj
 * @param {string} methodName
 */
function gioAsync(obj, methodName) {
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

exports.gioAsync = gioAsync;
