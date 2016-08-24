import {MessageType} from './message-type';

import {
  deserialize,
  deserializeBinary,
} from '../utils';

export enum Serialize {
  None,
  Binary,
  Recreator,
}

export interface Message<T> {
  messageId: string;
  messageSource: string;
  messageType: MessageType;
  serialize?: Serialize;
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
  switch (message.serialize) {
    case Serialize.Binary:
      message.content = deserializeBinary(<any> message.content);
      break;
    case Serialize.Recreator:
      message.content = deserialize(message.content);
      break;
    case Serialize.None:
      break;
    default:
      throw new Error(`Unknown serialization type: ${message.serialize}`);
  }

  message.serialize = Serialize.None;
};

