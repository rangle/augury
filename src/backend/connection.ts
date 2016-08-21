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
    const cannotRespond = () => {
      throw new Error('You cannot respond through MessageHandler');
    }

    subscriptions.forEach(handler => handler(message, cannotRespond));

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
