import {
  Message,
  MessageHandler,
  MessageFactory,
  MessageResponse,
  MessageType,
  Subscription,
  testResponse,
} from '../communication';

const subscriptions = new Set<MessageHandler>();

chrome.runtime.onMessage.addListener(
  (message: Message<any>, sender: chrome.runtime.MessageSender) => {
    if (message.messageType === MessageType.Response) {
      const cannotRespond = () => {
        throw new Error('You cannot respond to a response');
      }

      subscriptions.forEach(handler => handler(message, cannotRespond));
    }
    else {
      let responded = false;

      const respond = (messageResponse: MessageResponse<any>) => {
        if (responded) {
          throw new Error('Cannot respond to the same message twice');
        }

        chrome.runtime.sendMessage(messageResponse);

        responded = true;
      }

      subscriptions.forEach(handler => handler(message, respond));

      if (responded === false) {
        respond(MessageFactory.response(message, {processed: false}));
      }
    }

    return true;
  });

export const subscribe = (handler: MessageHandler) => {
  subscriptions.add(handler);

  return {
    unsubscribe: () => subscriptions.delete(handler)
  };
};

export const send = <T>(message: Message<T>) => {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message,
      response => {
        if (response) {
          resolve(response);
        }
        else {
          reject(chrome.runtime.lastError);
        }
      });
  });
};
