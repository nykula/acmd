const filesActions = require('../actions/files')
const panelsActions = require('../actions/panels')

const initialState = 0

exports.default = activePanelId
function activePanelId (state, action) {
  state = state || initialState

  switch (action.type) {
    case filesActions.CURSOR:
    case filesActions.SELECTED:
      return action.panelId

    case panelsActions.TOGGLED_ACTIVE:
      return state === 0 ? 1 : 0
  }

  return state
}
