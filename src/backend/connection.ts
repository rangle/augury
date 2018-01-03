import {
  Message,
  MessageHandler,
  MessageType,
  deserializeMessage,
} from '../communication';

const subscriptions = new Set<MessageHandler>();

chrome.runtime.onMessage.addListener(
  (message: Message<any>, sender: chrome.runtime.MessageSender) => {
    deserializeMessage(message);

    const cannotRespond = () => {
      throw new Error('You cannot respond through MessageHandler');
    };

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
  if (message.messageType === MessageType.CompleteTree ||
      message.messageType === MessageType.TreeDiff ||
      message.messageType === MessageType.DispatchWrapper) {
    /// These types of messages should never be sent through this mechanism. A DispatchWrapper
    /// message is for communication between content-script and the backend and has no business
    /// being sent to the frontend. Similarly, a message containing tree data should be sent
    /// through the {@link MessageBuffer} mechanism in backend.ts instead of through this port.
    /// Sending a message with the {@link send} function will cause that message to take a very
    /// circuitous route and will be serialized and deserialized repeatedly. Therefore large
    /// messages must be sent using the {@link MessageBuffer} mechanism in order to avoid major
    /// performance bottlenecks and UI latency.
    const description = MessageType[message.messageType];
    throw new Error(`A ${description} message should never be posted through the communication port`);
  }

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
