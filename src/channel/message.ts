import {MessageType} from './message-type';

export interface Message<T> {
  messageType: MessageType;
  message?: T;
}