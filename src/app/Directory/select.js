const Gdk = imports.gi.Gdk;
const { assign, range, sortedUniq } = require("lodash");

/**
 * @param {number[]} xs
 */
const uniqSort = xs => sortedUniq(xs.sort((a, b) => a - b));

/**
 * @typedef IState
 * @property {number} cursor
 * @property {number[]} indices
 * @property {number} limit
 * @property {number[]} selected
 * @property {number} top
 */

/**
 * @param {IState} state
 * @param {{ shiftKey: boolean, which: number }} ev
 * @returns {IState}
 */
exports.default = function(state, ev) {
  const { limit, indices, cursor, selected, top } = state;
  const { which, shiftKey } = ev;

  if ((shiftKey && which === Gdk.KEY_Down) || which === Gdk.KEY_Insert) {
    if (selected.indexOf(cursor) !== -1) {
      return assign({}, state, {
        cursor: Math.min(cursor + 1, indices.length - 1),
        selected: selected.filter(x => x !== cursor),
        top: Math.min(
          cursor + 2 > Math.floor(limit) ? top + 1 : top,
          indices.length - Math.floor(limit),
        ),
      });
    } else {
      return assign({}, state, {
        cursor: Math.min(cursor + 1, indices.length - 1),
        selected: selected.concat(cursor).sort((a, b) => a - b),
        top: Math.min(
          cursor + 2 > Math.floor(limit) ? top + 1 : top,
          indices.length - Math.floor(limit),
        ),
      });
    }
  }

  if (which === Gdk.KEY_Down) {
    return assign({}, state, {
      cursor: Math.min(cursor + 1, indices.length - 1),
      top: Math.min(
        cursor + 2 > Math.floor(limit) ? top + 1 : top,
        indices.length - Math.floor(limit),
      ),
    });
  }

  if (shiftKey && which === Gdk.KEY_Up) {
    if (selected.indexOf(cursor) !== -1) {
      return assign({}, state, {
        cursor: Math.max(0, cursor - 1),
        selected: selected.filter(x => x !== cursor),
      });
    } else {
      return assign({}, state, {
        cursor: Math.max(0, cursor - 1),
        selected: selected.concat(cursor).sort((a, b) => a - b),
      });
    }
  }

  if (which === Gdk.KEY_Up) {
    return assign({}, state, {
      cursor: Math.max(0, cursor - 1),
    });
  }

  if (shiftKey && which === Gdk.KEY_Page_Down) {
    if (selected.indexOf(cursor) !== -1) {
      return assign({}, state, {
        cursor: Math.min(cursor + Math.floor(limit) - 2, indices.length - 1),
        selected: selected.filter(
          x => range(cursor, cursor + Math.floor(limit) - 2).indexOf(x) === -1,
        ),
        top:
          cursor + Math.floor(limit) - 2 >= top + Math.floor(limit)
            ? Math.min(cursor - 1, indices.length - Math.floor(limit))
            : top,
      });
    } else {
      return assign({}, state, {
        cursor: Math.min(cursor + Math.floor(limit) - 2, indices.length - 1),
        selected: uniqSort(
          selected.concat(
            range(
              cursor,
              Math.min(cursor + Math.floor(limit) - 2, indices.length),
            ),
          ),
        ),
        top:
          cursor + Math.floor(limit) - 2 >= top + Math.floor(limit)
            ? Math.min(cursor - 1, indices.length - Math.floor(limit))
            : top,
      });
    }
  }

  if (which === Gdk.KEY_Page_Down) {
    return assign({}, state, {
      cursor: Math.min(cursor + Math.floor(limit) - 1, indices.length - 1),
      top: Math.min(
        cursor > 0 ? cursor : top,
        indices.length - Math.floor(limit),
      ),
    });
  }

  if (shiftKey && which === Gdk.KEY_Page_Up) {
    if (selected.indexOf(cursor) !== -1) {
      return assign({}, state, {
        cursor: Math.max(0, cursor - Math.floor(limit) + 2),
        selected: selected.filter(
          x =>
            range(
              Math.max(0, cursor - Math.floor(limit) + 3),
              cursor + 1,
            ).indexOf(x) === -1,
        ),
      });
    } else {
      return assign({}, state, {
        cursor: Math.max(0, cursor - Math.floor(limit) + 2),
        selected: uniqSort(
          selected.concat(
            range(Math.max(0, cursor - Math.floor(limit) + 3), cursor + 1),
          ),
        ),
        top: Math.max(
          0,
          cursor - Math.floor(limit) + 2 < top
            ? cursor - Math.floor(limit) + 2
            : top,
        ),
      });
    }
  }

  if (which === Gdk.KEY_Page_Up) {
    return assign({}, state, {
      cursor: Math.max(0, cursor - Math.floor(limit) + 1),
      top: Math.max(
        0,
        cursor - Math.floor(limit) + 1 < top
          ? cursor - Math.floor(limit) + 1
          : top,
      ),
    });
  }

  if (which === Gdk.KEY_space) {
    if (selected.indexOf(cursor) !== -1) {
      return assign({}, state, {
        selected: selected.filter(x => x !== cursor),
      });
    } else {
      return assign({}, state, {
        selected: selected.concat(cursor).sort((a, b) => a - b),
      });
    }
  }

  return state;
};
