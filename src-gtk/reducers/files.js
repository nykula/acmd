const actions = require('../actions/files')
const assign = require('lodash/assign')
const indexActions = require('../actions')

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
    case actions.CURSOR: {
      return assign({}, state, {
        active: (() => {
          const active = assign({}, state.active)
          active[payload.panelId] = payload.cursor
          return active
        })()
      })
    }

    case actions.SELECTED: {
      if (payload.selected.length === 1) {
        return assign({}, state, {
          active: (() => {
            const active = assign({}, state.active)
            active[payload.panelId] = payload.selected[0]
            return active
          })()
        })
      } else {
        return state
      }
    }

    case indexActions.LS: {
      if (payload.result) {
        return assign({}, state, {
          byPanel: (() => {
            const byPanel = assign({}, state.byPanel)
            byPanel[payload.panel] = payload.result.files
            return byPanel
          })()
        })
      } else {
        return state
      }
    }

    default:
      return state
  }
}
