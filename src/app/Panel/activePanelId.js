const FileAction = require('../File/FileAction')
const PanelAction = require('../Panel/PanelAction')

const initialState = 0

exports.default = activePanelId
function activePanelId (state, action) {
  state = state || initialState

  switch (action.type) {
    case FileAction.CURSOR:
    case FileAction.SELECTED:
      return action.panelId

    case PanelAction.TOGGLED_ACTIVE:
      return state === 0 ? 1 : 0
  }

  return state
}
