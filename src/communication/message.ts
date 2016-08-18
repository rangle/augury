import {MessageType} from './message-type';

export interface Message<T> {
  messageId: string;
  messageSource: string;
  messageType: MessageType;
  content?: T;
}

export class MessageResponse<T> implements Message<T> {
  public messageId;
  public messageSource;
  public messageType;
  public messageResponseId: string;
  public content: T;
  public error: Error;

  constructor(request: Message<any>, response: T | Error) {
    this.messageId = null;
    this.messageSource = request.messageSource;
    this.messageResponseId = request.messageId;

    if (response instanceof Error) {
      this.error = response;
    }
    else {
      this.content = response;
    }
  }
}

export interface MessageHandler {
  <T>(message: Message<T>): any;
}

export interface Subscription {
  unsubscribe(): void;
}

export const messageSource = 'AUGURY_INSPECTED_APPLICATION';

export const testSource =
  <T>(message: Message<T>) => message.messageSource === messageSource;

export const testResponse =
  <T>(request: Message<T>, response: MessageResponse<T>) => {
    return testSource(response)
        && response.messageResponseId === request.messageId
        && response.messageType === MessageType.Response;
  }