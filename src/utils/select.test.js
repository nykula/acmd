/* global expect, imports, it */
const Gdk = imports.gi.Gdk
const range = require('lodash/range')
const reducer = require('./select').default

handle({
  '': [0, null, 0],
  Down: [1, null, 0],
  Shift__Down: [1, 0, 0],
  Up: [0, null, 0],
  Shift__Up: [0, 0, 0],
  Page_Down: [13, null, 0],
  Shift__Page_Down: [12, '0 11', 0],
  Page_Up: [0, null, 0],
  Shift__Page_Up: [0, 0, 0]
})

handle({
  '': [0, 0, 0],
  Down: [1, 0, 0],
  Shift__Down: [1, null, 0],
  Up: [0, 0, 0],
  Shift__Up: [0, null, 0],
  Page_Down: [13, 0, 0],
  Shift__Page_Down: [12, null, 0],
  Page_Up: [0, 0, 0],
  Shift__Page_Up: [0, null, 0]
})

handle({
  '': [0, '0 5 7 11', 0],
  Down: [1, '0 5 7 11', 0],
  Shift__Down: [1, '1 5 7 11', 0],
  Up: [0, '0 5 7 11', 0],
  Shift__Up: [0, '1 5 7 11', 0],
  Page_Down: [13, '0 5 7 11', 0],
  Shift__Page_Down: [12, null, 0],
  Page_Up: [0, '0 5 7 11', 0],
  Shift__Page_Up: [0, '1 5 7 11', 0]
})

handle({
  '': [12, '0 11', 0],
  Down: [13, '0 11', 0],
  Shift__Down: [13, '0 12', 0],
  Up: [11, '0 11', 0],
  Shift__Up: [11, '0 12', 0],
  Page_Down: [25, '0 11', 12],
  Shift__Page_Down: [24, '0 23', 11],
  Page_Up: [0, '0 11', 0],
  Shift__Page_Up: [0, '0 12', 0]
})

handle({
  '': [0, '0 12', 0],
  Down: [1, '0 12', 0],
  Shift__Down: [1, '1 12', 0],
  Up: [0, '0 12', 0],
  Shift__Up: [0, '1 12', 0],
  Page_Down: [13, '0 12', 0],
  Shift__Page_Down: [12, 12, 0],
  Page_Up: [0, '0 12', 0],
  Shift__Page_Up: [0, '1 12', 0]
})

handle({
  '': [12, 12, 0],
  Down: [13, 12, 0],
  Shift__Down: [13, null, 0],
  Up: [11, 12, 0],
  Shift__Up: [11, null, 0],
  Page_Down: [25, 12, 12],
  Shift__Page_Down: [24, null, 11],
  Page_Up: [0, 12, 0],
  Shift__Page_Up: [0, null, 0]
})

handle({
  '': [2, null, 0],
  Down: [3, null, 0],
  Shift__Down: [3, 2, 0],
  Up: [1, null, 0],
  Shift__Up: [1, 2, 0],
  Page_Down: [15, null, 2],
  Shift__Page_Down: [14, '2 13', 1],
  Page_Up: [0, null, 0],
  Shift__Page_Up: [0, '0 2', 0]
})

handle({
  '': [2, 2, 0],
  Down: [3, 2, 0],
  Shift__Down: [3, null, 0],
  Up: [1, 2, 0],
  Shift__Up: [1, null, 0],
  Page_Down: [15, 2, 2],
  Shift__Page_Down: [14, null, 1],
  Page_Up: [0, 2, 0],
  Shift__Page_Up: [0, null, 0]
})

handle({
  '': [12, null, 0],
  Down: [13, null, 0],
  Shift__Down: [13, 12, 0],
  Up: [11, null, 0],
  Shift__Up: [11, 12, 0],
  Page_Down: [25, null, 12],
  Shift__Page_Down: [24, '12 23', 11],
  Page_Up: [0, null, 0],
  Shift__Page_Up: [0, '1 12', 0]
})

handle({
  '': [13, null, 0],
  Down: [14, null, 1],
  Shift__Down: [14, 13, 1],
  Up: [12, null, 0],
  Shift__Up: [12, 13, 0],
  Page_Down: [25, null, 12],
  Shift__Page_Down: [25, '13 24', 12],
  Page_Up: [0, null, 0],
  Shift__Page_Up: [1, '2 13', 0]
})

handle({
  '': [13, 13, 0],
  Down: [14, 13, 1],
  Shift__Down: [14, null, 1],
  Up: [12, 13, 0],
  Shift__Up: [12, null, 0],
  Page_Down: [25, 13, 12],
  Shift__Page_Down: [25, null, 12],
  Page_Up: [0, 13, 0],
  Shift__Page_Up: [1, null, 0]
})

handle({
  '': [25, null, 12],
  Down: [25, null, 12],
  Shift__Down: [25, 25, 12],
  Up: [24, null, 12],
  Shift__Up: [24, 25, 12],
  Page_Down: [25, null, 12],
  Shift__Page_Down: [25, 25, 12],
  Page_Up: [12, null, 12],
  Shift__Page_Up: [13, '14 25', 12]
})

handle({
  '': [25, 25, 12],
  Down: [25, 25, 12],
  Shift__Down: [25, null, 12],
  Up: [24, 25, 12],
  Shift__Up: [24, null, 12],
  Page_Down: [25, 25, 12],
  Shift__Page_Down: [25, null, 12],
  Page_Up: [12, 25, 12],
  Shift__Page_Up: [13, null, 12]
})

handle({
  '': [13, '14 25', 12],
  Down: [14, '14 25', 12],
  Shift__Down: [14, '13 25', 12],
  Up: [12, '14 25', 12],
  Shift__Up: [12, '13 25', 12],
  Page_Down: [25, '14 25', 12],
  Shift__Page_Down: [25, '13 25', 12],
  Page_Up: [0, '14 25', 0],
  Shift__Page_Up: [1, '2 25', 1]
})

handle({
  '': [25, '13 25', 12],
  Down: [25, '13 25', 12],
  Shift__Down: [25, '13 24', 12],
  Up: [24, '13 25', 12],
  Shift__Up: [24, '13 24', 12],
  Page_Down: [25, '13 25', 12],
  Shift__Page_Down: [25, '13 24', 12],
  Page_Up: [12, '13 25', 12],
  Shift__Page_Up: [13, 13, 12]
})

function handle (pairs) {
  const state = State(pairs[''])

  for (let key in pairs) {
    if (!key) {
      continue
    }

    const msg = JSON.stringify([pairs[''], key, pairs[key]]).slice(1, -1)

    it(msg, () => {
      const keys = key.split('__')
      const ev = {
        which: Gdk['KEY_' + keys[keys.length - 1]],
        shiftKey: keys.indexOf('Shift') !== -1
      }

      const nextState = reducer(state, ev)
      const expectedState = State(pairs[key])
      expect(nextState).toEqual(expectedState)
    })
  }
}

/**
 * Selects files from a given start name to a given end name, inclusive.
 */
function Selected (selected) {
  if (selected === null) {
    return []
  }

  if (typeof selected === 'number') {
    return [selected]
  }

  const xs = selected.split(' ').map(x => Number(x))
  const _selected = []

  for (let i = 0; i < xs.length; i += 2) {
    const iFirst = xs[i]
    const iLast = xs[i + 1]

    for (let j = iFirst; j <= iLast; j++) {
      _selected.push(j)
    }
  }

  return _selected
}

function State ([cursor, selected, top]) {
  const state = reducer({
    limit: 14.78,
    indices: range(0, 25 + 1),
    cursor: cursor,
    selected: Selected(selected),
    top: top
  }, { type: '@@redux/INIT' })

  return state
}
