import {combineReducers} from 'redux'
import conversationReducer from './conversationReducer'
import relevantFlightsReducer from './relevantFlightsReducer'

const RootReducer = combineReducers({
  conversation: conversationReducer,
  relevantFlights: relevantFlightsReducer
})

export default RootReducer
