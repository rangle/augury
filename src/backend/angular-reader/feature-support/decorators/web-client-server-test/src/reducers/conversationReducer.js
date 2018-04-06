import * as types from '../actions/conversationActionTypes'

const initialState = {
  messageHistory: [],
  context: {},
  nextHandler: null,


}

export default function(state = initialState, action) {
  switch(action.type) {

    // general purpose development reducer
    case 'UPDATE_STATE':
      return _o(state, action.patch)

    case types.ADD_MSG:
      return _o(state, {
        messageHistory: state.messageHistory.concat(action.msg)
      })
    case types.UPDATE_SYSTEM:
      return _o(state, {
        context: _o(state.context, {
          system: action.systemState,
          conversation_id: action.conversationId
        })
      })
    case types.SET_ARRIVAL_CITY:
      return _o(state, {
        context: _o(state.context, {
          arrival_city: action.params.city,
          last_action: action.type
        })
      })
    case types.SET_DEPARTURE_CITY:
      return _o(state, {
        context: _o(state.context, {
          departure_city: action.params.city,
          last_action: action.type
        })
      })
    case types.RESET_ARRIVAL_CITY:
      return _o(state, {
        context: _o(state.context, {
          arrival_city: undefined,
          last_action: undefined
        })
      })
    case types.RESET_DEPARTURE_CITY:
      return _o(state, {
        context: _o(state.context, {
          departure_city: undefined,
          last_action: undefined
        })
      })
    case types.RESET_CITIES:
      return _o(state, {
        context: _o(state.context, {
          departure_city: undefined,
          arrival_city: undefined,
          last_action: undefined
        })
      })
    case 'SET_CONVERSATION_HANDLER':
      return _o(state, {
        handler: action.handler
      })

    default:
      return state;
  }
}

// helpers -----

function _o(object, ...extensions){
  return Object.assign({}, object, ...extensions)
}
