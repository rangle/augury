import {MessageType} from './message-type';

import {deserialize} from '../utils';

export interface Message<T> {
  messageId: string;
  messageSource: string;
  messageType: MessageType;
  serialized?: boolean;
  content?: T;
}

export interface MessageResponse<T> extends Message<T> {
  messageResponseId: string;
  error?: Error;
}

export interface MessageHandler {
  <T>(message: Message<T>, sendResponse: (response: MessageResponse<any>) => void): any;
}

export interface Subscription {
  unsubscribe(): void;
}

export const messageSource = 'AUGURY_INSPECTED_APPLICATION';

export const checkSource =
  <T>(message: Message<T>) => message.messageSource === messageSource;

export const testResponse =
  <T>(request: Message<T>, response: MessageResponse<T>) => {
    return checkSource(response)
        && response.messageResponseId === request.messageId
        && response.messageType === MessageType.Response;
  };

export const deserializeMessage = <T>(message: Message<T>) => {
  if (message.serialized) {
    if (typeof message.content !== 'string') {
      throw new Error('Message is marked serialized but is not a string');
    }
    message.content = deserialize(message.content);
    message.serialized = false;
  }
};

