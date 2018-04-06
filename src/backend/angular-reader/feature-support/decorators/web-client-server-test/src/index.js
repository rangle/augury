import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import './index.css'
import App from './App'
import registerServiceWorker from './registerServiceWorker'
import { createConversationService } from './services/ConversationService'

// CONVERSATION STUFF
import { conversationStateReducer, conversationGraph } from './services/conversation-graph'
import { createWFConversationGraph } from './services/app-graph'


import mySaga from './sagas'

// create store
import {createStore, applyMiddleware} from 'redux'
//import rootReducer from './reducers/rootReducer'
import thunk from 'redux-thunk'
import createSagaMiddleware from 'redux-saga'

import {combineReducers} from 'redux'
import conversationReducer from './reducers/conversationReducer'
import relevantFlightsReducer from './reducers/relevantFlightsReducer'

const rootReducer = combineReducers({
  _conv_: conversationStateReducer, // right now needs to be _conv_
  conversation: conversationReducer,
  relevantFlights: relevantFlightsReducer
})

const sagaMiddleware = createSagaMiddleware()

// create store
const store = createStore(
  rootReducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
  applyMiddleware(thunk, sagaMiddleware),
)

window.s = store

sagaMiddleware.run(mySaga)

const WFConversationGraph = createWFConversationGraph(store)

// how to make this more functional?
// service should probably give out a stream?
const conversationService = createConversationService(WFConversationGraph.handleMsg)

ReactDOM.render(
  <Provider store={store}>
      <App />
  </Provider>,
  document.getElementById('root')
)

registerServiceWorker()
