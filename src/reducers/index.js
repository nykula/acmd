import activeFile from './activeFile'
import activePanel from './activePanel'
import files from './files'
import { combineReducers } from 'redux'

const rootReducer = combineReducers({
  activeFile,
  activePanel,
  files
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
      return state
  }
}
