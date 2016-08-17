import {Message} from './message';
import {MessageType} from './message-type';

export interface DispatchHandler {
  <Message, Response>(message: Message): Response;
}

const subscriptions = new Set<DispatchHandler>();

export const subscribe = (handler: DispatchHandler) => {
  subscriptions.add(handler);
};

export const subscribeOnce = (messageType: MessageType, handler: DispatchHandler) => {
  const messageHandler = <T>(message: Message<T>) => {
    if (message.messageType === messageType) {
      try {
        return handler(message);
      }
      finally {
        unsubscribe(messageHandler);
      }
    }
  }

  subscribe(messageHandler);
};

export const unsubscribe = (handler: DispatchHandler) => {
  subscriptions.delete(handler);
}

export const dispatch = <T>(message: Message<T>) => {
  window.postMessage(message, '*');
}

window.addEventListener('message',
  (event: MessageEvent) => {
    subscriptions.forEach(handler => {
      try {
        const result = handler(event.data);
        if (result != null) {
          return result;
        }
      }
      catch (error) {
        console.error(`Message dispatch failed: ${JSON.stringify(event.data)}`, error);
      }
    });
  });