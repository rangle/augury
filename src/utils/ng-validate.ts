import {messageJumpContext, browserSubscribeOnce} from '../communication/message-dispatch';
import {MessageFactory} from '../communication/message-factory';
import {MessageType} from '../communication/message-type';
import {Message} from '../communication/message';
import {send} from '../backend/indirect-connection';

import {isAngular, isDebugMode} from '../backend/utils/app-check';
import {ApplicationError, ApplicationErrorType} from '../communication';
(<any> window).isAngular = isAngular;
(<any> window).isDebugMode = isDebugMode;


declare const getAllAngularTestabilities: Function;
declare const getAllAngularRootElements: Function;
declare const ng: any;

let unsubscribe: () => void;

let errorToSend: Message<ApplicationError>;

const sendError = () => {
  if (errorToSend) {
    send(errorToSend);
  }
};

const handler = () => {
  if (isAngular()) {
    if (isDebugMode()) {
      messageJumpContext(MessageFactory.frameworkLoaded());
      if (unsubscribe) {
        unsubscribe();
      }
      errorToSend = null;
      return true;
    }
    errorToSend = MessageFactory.applicationError(
      new ApplicationError(ApplicationErrorType.ProductionMode));
  } else {
    errorToSend = MessageFactory.notNgApp();
  }

  browserSubscribeOnce(MessageType.Initialize, sendError);

  sendError();

  return false;
};

if (!handler()) {
  const subscribe = () => {
    if (MutationObserver) {
      const observer = new MutationObserver(mutations => handler());
      observer.observe(document, { childList: true, subtree: true });

      return () => observer.disconnect();
    }

    const eventKeys = ['DOMNodeInserted', 'DOMNodeRemoved'];

    eventKeys.forEach(k => document.addEventListener(k, handler, false));

    return () => eventKeys.forEach(k => document.removeEventListener(k, handler, false));
  };

  unsubscribe = subscribe();
}

