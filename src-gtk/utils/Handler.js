const memoize = require('memoizerific/memoizerific')

/**
 * Memoizes a curried function that receives two arguments: a Redux dispatch
 * and a callback that dispatches actions.
 */
exports.default = fun => memoize(1)(dispatch => memoize(0)(fun(dispatch)))
