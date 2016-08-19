import {
  Message,
  MessageResponse,
  Subscription,
  checkSource,
} from './message';

import {MessageType} from './message-type';

import {
  deserialize,
  serialize,
} from '../utils/serialize';

export interface DispatchHandler {
  <T, Response>(message: Message<T>): Response;
}

const subscriptions = new Set<DispatchHandler>();

const dispatchers = new Set<DispatchHandler>();

export const browserSubscribeDispatch = (handler: DispatchHandler): Subscription => {
  dispatchers.add(handler);

  return {
    unsubscribe: () => dispatchers.delete(handler)
  };
}

export const browserSubscribe = (handler: DispatchHandler): Subscription => {
  subscriptions.add(handler);

  return {
    unsubscribe: () => subscriptions.delete(handler)
  };
};

export const browserSubscribeOnce = (messageType: MessageType, handler: DispatchHandler) => {
  const messageHandler = <T>(message: Message<T>) => {
    if (message.messageType === messageType) {
      try {
        return handler(message);
      }
      finally {
        subscription.unsubscribe();
      }
    }
  }

  const subscription = browserSubscribe(messageHandler);
};

export const browserSubscribeResponse = (messageId: string, handler: DispatchHandler) => {
  const messageHandler = <T>(response: MessageResponse<T>) => {
    if (response.messageType === MessageType.Response &&
        response.messageResponseId === messageId) {
      try {
        return handler(response);
      }
      finally {
        subscription.unsubscribe();
      }
    }
  }

  const subscription = browserSubscribe(messageHandler);
};

export const browserUnsubscribe = (handler: DispatchHandler) =>
  subscriptions.delete(handler);

export const browserDispatch = <T>(message: Message<T>) => window.postMessage(serialize(message), '*');

window.addEventListener('message',
  (event: MessageEvent) => {
    if (typeof event.data !== 'string') {
      return;
    }

    const msg = deserialize(event.data);

    if (checkSource(msg) === false) {
      return;
    }

    if (msg.messageType === MessageType.DispatchWrapper) {
      dispatchers.forEach(handler => handler(msg));
    }
    else {
      subscriptions.forEach(handler => handler(msg));
    }
  });