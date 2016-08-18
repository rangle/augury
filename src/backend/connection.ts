import {
  Message,
  MessageHandler,
  MessageFactory,
  MessageResponse,
  MessageType,
  Subscription,
  testSource,
  testResponse,
} from '../communication';

const subscriptions = new Set<MessageHandler>();

chrome.runtime.onMessage.addListener(
  (message: Message<any>, sender: chrome.runtime.MessageSender, sendResponse) => {
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
        sendResponse(MessageFactory.response(message, handlerResult));
        break;
      }

      result = values.next();
    }
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
