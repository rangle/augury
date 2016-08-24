import {
  Message,
  MessageResponse,
  Subscription,
  checkSource,
  deserializeMessage,
} from './message';

import {MessageFactory} from './message-factory';
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
};

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
        deserializeMessage(message);

        return handler(message);
      }
      finally {
        subscription.unsubscribe();
      }
    }
  };

  const subscription = browserSubscribe(messageHandler);
};

export const browserSubscribeResponse = (messageId: string, handler: DispatchHandler) => {
  const messageHandler = <T>(response: MessageResponse<T>) => {
    if (response.messageType === MessageType.Response &&
        response.messageResponseId === messageId) {
      try {
        deserializeMessage(response);

        return handler(response);
      }
      finally {
        subscription.unsubscribe();
      }
    }
  };

  const subscription = browserSubscribe(messageHandler);
};

export const browserUnsubscribe = (handler: DispatchHandler) =>
  subscriptions.delete(handler);

export const browserDispatch = <T>(message: Message<T>) => window.postMessage(message, '*');

window.addEventListener('message',
  (event: MessageEvent) => {
    const msg = event.data;

    if (checkSource(msg) === false) {
      return;
    }

    if (msg.messageType === MessageType.DispatchWrapper) {
      dispatchers.forEach(handler => handler(msg));
    }
    else if (msg.messageType !== MessageType.Response) {
      let dispatchResult;
      subscriptions.forEach(handler => {
        if (dispatchResult == null) {
          dispatchResult = handler(msg);
        }
        else {
          handler(msg);
        }
      });

      if (dispatchResult !== undefined) {
        const response =
          MessageFactory.dispatchWrapper(
            MessageFactory.response(msg, dispatchResult, true));
        browserDispatch(response);
      }
    }
    else {
      subscriptions.forEach(handler => handler(msg));
    }
  });

