import {Injectable} from '@angular/core';

import {
  Message,
  MessageFactory,
  MessageHandler,
  MessageResponse,
  MessageType,
  Subscription,
  deserializeMessage,
  testResponse,
} from '../../communication';

import {deserialize} from '../../utils';

const subscriptions = new Set<MessageHandler>();

const connection = chrome.runtime.connect();

const post = <T>(message: Message<T>) =>
  connection.postMessage(
    Object.assign({}, message, {
      tabId: chrome.devtools.inspectedWindow.tabId,
    }));

export const connect = () => {
  connection.onMessage.addListener(
    (message: Message<any>, port: chrome.runtime.Port) => {
      deserializeMessage(message);

      if (message.messageType === MessageType.Response) {
        const cannotRespond = () => {
          throw new Error('You cannot respond to a response');
        }

        subscriptions.forEach(handler => handler(message, cannotRespond));
      }
      else {
        let responded = false;

        const sendResponse = (messageResponse: MessageResponse<any>) => {
          post(messageResponse);
        }

        subscriptions.forEach(handler => {
          const respond = (response: MessageResponse<any>) => {
            sendResponse(response);
            responded = true;
          };

          handler(message, respond);
        });

        if (responded === false) {
          sendResponse(MessageFactory.response(message, {processed: false}, false));
        }
      }
    });
};

export const subscribe = (handler: MessageHandler): Subscription => {
  subscriptions.add(handler);

  return {
    unsubscribe: () => subscriptions.delete(handler)
  };
};

export const send = <Response, T>(message: Message<T>): Promise<Response> => {
  if (connection == null) {
    throw new Error('No connection to send messsage through!');
  }

  return new Promise((resolve, reject) => {
    const responseHandler = (response: MessageResponse<any>) => {
      if (testResponse(message, response)) {
        connection.onMessage.removeListener(<any> responseHandler);

        if (response.error) {
          reject(response.error);
        }
        else {
          resolve(response.content);
        }
      }
    };

    connection.onMessage.addListener(responseHandler);

    post(message);
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

  send<Response, T>(message: Message<T>): Promise<Response> {
    return send(message);
  }

  close() {
    subscriptions.clear();
  }
}