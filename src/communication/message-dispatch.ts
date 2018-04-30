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

  const subscription = browserSubscribe(<DispatchHandler>messageHandler);
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

  const subscription = browserSubscribe(<DispatchHandler>messageHandler);
};

export const browserUnsubscribe = (handler: DispatchHandler) =>
  subscriptions.delete(handler);

export const messageJumpContext = <T>(message: Message<T>) => {
  window.postMessage(message, '*');
};

export const browserDispatch = <T>(message: Message<T>) => {
  if (checkSource(message) === false) {
    return;
  }

  if (message.messageType === MessageType.DispatchWrapper) {
    dispatchers.forEach(handler => handler(message));
  }
  else if (message.messageType !== MessageType.Response) {
    let dispatchResult;
    subscriptions.forEach(handler => {
      if (dispatchResult == null) {
        dispatchResult = handler(message);
      }
      else {
        handler(message);
      }
    });

    if (dispatchResult !== undefined) {
      const response =
        MessageFactory.dispatchWrapper(
          MessageFactory.response(message, dispatchResult, false));
      messageJumpContext(response);
    }
  }
  else {
    subscriptions.forEach(handler => handler(message));
  }
};

window.addEventListener('message',
  (event: MessageEvent) => {
    if (event.source === window) {
      browserDispatch(event.data);
    }
  });
