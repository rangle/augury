import {ApplicationError, ApplicationErrorType} from '../communication/application-error';
import {
  Message,
  MessageType,
  MessageFactory,
  deserializeMessage,
} from '../communication';

export const reportUncaughtError = (err: Error) => {
  chrome.runtime.sendMessage(MessageFactory.sendUncaughtError(err));
};

export const subscribeToUncaughtExceptions = (fn) => {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message && message.messageType === MessageType.SendUncaughtError) {
      deserializeMessage(message);
      fn(message.content);
    }
  });
};
