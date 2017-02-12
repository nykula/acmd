import activeFile from './activeFile'
import activePanel from './activePanel'
import connection from './connection'
import files from './files'
import locations from './locations'
import { combineReducers } from 'redux'

const rootReducer = combineReducers({
  activeFile,
  activePanel,
  connection,
  files,
  locations
})

export default (_state, payload) => {
  const state = rootReducer(_state, payload)

  switch (payload.type) {
    case 'prevFile': {
      const activePanel = state.activePanel
      const activeFile = state.activeFile

      const current = activeFile[activePanel]
      const min = 0

      if (current - 1 < min) {
        return state
      }

      return { ...state,
        activeFile: { ...activeFile,
          [activePanel]: current - 1
        }
      }
    }

    case 'nextFile': {
      const activePanel = state.activePanel
      const activeFile = state.activeFile

      const current = activeFile[activePanel]
      const max = state.files[activePanel].length - 1

      if (current + 1 > max) {
        return state
      }

      return { ...state,
        activeFile: { ...activeFile,
          [activePanel]: current + 1
        }
      }
    }

    default:
      return { ...state,
        activeFile: [
          Math.max(0, Math.min(state.activeFile[0], state.files[0].length - 1)),
          Math.max(0, Math.min(state.activeFile[1], state.files[1].length - 1))
        ]
      }
  }
}
