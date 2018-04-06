import SocketIO from 'socket.io-client';
import { receiveMsg } from '../actions/conversationActions';
import { updateArrivalCity } from '../actions/flightsActions'
import * as ConversationActionsTypes from '../actions/conversationActionTypes'

class ConversationService {

  constructor(handleMsg){

    const handleMessage = msg => {

      console.log('--- pre handle');
      console.log(msg);

      handleMsg(msg.response)
        .then(() => {

          console.log('--- done handle');

        })

    }

    this.socket = SocketIO('http://localhost:8080');
    this.socket.on('connect', () => { console.log('socket connected') });
    this.socket.on('disconnect', () => { console.log('socket disconnected') });
    this.socket.on('msg', msg => handleMessage(msg))

  }

  sendMsg(msg){
    return this.socket.emit('msg', msg)
  }

}

// singleton instance
let instance

export function createConversationService(handleMsg){
  instance = new ConversationService(handleMsg)
}

export function getConversationService(){
  return instance
}
