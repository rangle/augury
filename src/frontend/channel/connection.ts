import {Injectable} from '@angular/core';

import {
  Message,
  MessageFactory,
  MessageHandler,
  MessageResponse,
  MessageType,
  Subscription,
  testSource,
  testResponse,
} from '../../communication';

const subscriptions = new Set<MessageHandler>();

let connection: chrome.runtime.Port;

export const connect = () => {
  connection = chrome.runtime.connect();

  connection.postMessage(
    Object.assign(MessageFactory.bootstrap(), {
      tabId: chrome.devtools.inspectedWindow.tabId
    }));

  connection.onMessage.addListener(
    (message: Message<any>, port: chrome.runtime.Port) => {
      // Message responses will be handled by a separate onMessage subscription below
      if (testSource(message) && message.messageType === MessageType.Response) {
        return;
      }

      const values = subscriptions.values();

      let result: IteratorResult<MessageHandler> = values.next();
      while (result.done === false) {
        const handlerResult = result.value(message);

        /// The first subscription handler who returns a non-null result gets the
        /// privilege of sending the message response.
        if (handlerResult != null) {
          port.postMessage(MessageFactory.response(message, handlerResult));
          return;
        }

        result = values.next();
      }

      throw new Error(`Message was not handled: ${JSON.stringify(message)}`);
    });

  connection.onDisconnect.addListener(() => {
    console.warn('Lost connection to Augury extension');
  });
};

export const subscribe = (handler: MessageHandler): Subscription => {
  subscriptions.add(handler);

  return {
    unsubscribe: () => subscriptions.delete(handler)
  };
};

export const send = <Response, T>(message: Message<T>): Promise<MessageResponse<Response>> => {
  if (connection == null) {
    throw new Error('No connection to send messsage through!');
  }

  return new Promise(resolve => {
    const responseHandler = (response: MessageResponse<any>) => {
      if (testResponse(message, response)) {
        connection.onMessage.removeListener(<any> responseHandler);

        resolve(response.content);
      }
    };

    connection.onMessage.addListener(responseHandler);

    connection.postMessage(message);
  });
}

@Injectable()
export class Connection {
  connect() {
    connect();
  }

  subscribe(handler: MessageHandler): Subscription {
    return subscribe(handler);
  }

  send<Response, T>(message: Message<T>): Promise<MessageResponse<Response>> {
    return send(message);
  }

  close() {
    subscriptions.clear();
  }
}