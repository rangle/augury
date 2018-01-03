import {ApplicationError, ApplicationErrorType} from '../communication/application-error';
import {
  MessageFactory,
} from '../communication';

export const reportUncaughtError = (err: SerializeableError, ngVersion: string) => {
  chrome.runtime.sendMessage(MessageFactory.sendUncaughtError(err, ngVersion));
};

export interface SerializeableError {
  name: string;
  message: string;
  stack: string;
}
