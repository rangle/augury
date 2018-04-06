import * as types from '../actions/conversationActionTypes'
import { getConversationService } from '../services/ConversationService'

export function sendMsg(text){
  return (dispatch, getState) => {
    const { context } = getState().conversation
    const msg = { text, context }
    getConversationService().sendMsg(msg)
    dispatch(_addUserMsg(text))
  }
}

export function receiveMsg(msg){
  return dispatch => {
    dispatch(_updateSystemAction(msg))
    if(_msgAction(msg)) dispatch(_msgAction(msg))
    dispatch(_addBotMsg(_msgText(msg)))
  }
}

// helpers -----

function _addUserMsg(text){
  return _addMsg(text, 'user')
}

function _addBotMsg(text){
  return _addMsg(text, 'bot')
}

function _addMsg(text, username){
  return {
    type: types.ADD_MSG,
    msg: { text, username }
  }
}

function _updateSystemAction(msg){
  return {
    type: types.UPDATE_SYSTEM,
    systemState: msg.response.context.system,
    conversationId: msg.response.context.conversation_id
  }
}

function _msgAction(msg){
  if(!msg.response.output.action) return undefined
  else return {
    type: msg.response.output.action,
    params: msg.response.output.action_params
  }
}

function _msgText(msg){
  return msg.response.output.text
}
