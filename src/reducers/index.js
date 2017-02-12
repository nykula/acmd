import activePanel from './activePanel'
import cart from './cart'
import { combineReducers } from 'redux'

const rootReducer = combineReducers({
  activePanel,
  cart
})

export default rootReducer
