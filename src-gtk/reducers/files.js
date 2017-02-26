const assign = require('lodash/assign')

const sampleFiles = [
  {
    name: '..',
    fileType: 'DIRECTORY',
    size: 0,
    modificationTime: Date.now(),
    mode: '0755'
  },
  {
    name: 'clan in da front.txt',
    size: 4110,
    modificationTime: Date.now(),
    mode: '0644'
  }
]

const initialState = {
  active: {
    0: 0,
    1: 0
  },
  byPanel: {
    0: sampleFiles,
    1: sampleFiles
  }
}

exports.default = (_state, payload) => {
  const state = _state || initialState

  switch (payload.type) {
    case 'CURSOR': {
      let __state = assign({}, state)
      __state.active[payload.panelId] = payload.cursor
      return __state
    }

    case 'SELECTED': {
      if (payload.selected.length === 1) {
        let __state = assign({}, state)
        __state.active[payload.panelId] = payload.selected[0]
        return __state
      } else {
        return state
      }
    }

    default:
      return state
  }
}
