import {messageJumpContext, browserSubscribeOnce} from '../communication/message-dispatch';
import {MessageFactory} from '../communication/message-factory';
import {MessageType} from '../communication/message-type';
import {send} from '../backend/indirect-connection';

declare const getAllAngularTestabilities: Function;
declare const getAllAngularRootElements: Function;
declare const ng: any;

let unsubscribe: () => void;

const handler = () => {
  // variable getAllAngularTestabilities will be defined by Angular
  // in debug mode for an Angular application.
  if (ng && (<any>window).getAllAngularRootElements && ng.probe(getAllAngularRootElements()[0])) {
    messageJumpContext(MessageFactory.frameworkLoaded());

    if (unsubscribe) {
      unsubscribe();
    }

    return true;
  }

  // We do this to make sure message is display when Augury is first opened.
  browserSubscribeOnce(MessageType.Initialize, () => {
    send(MessageFactory.notNgApp());
  });

  // Called each time browser is refreshed.
  send(MessageFactory.notNgApp());

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

