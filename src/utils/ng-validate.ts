import {dispatch} from '../channel/dispatch';
import {MessageFactory} from '../channel/message-factory';

declare const getAllAngularTestabilities: Function;

let unsubscribe: () => void;

const handler = () => {
  if (typeof getAllAngularTestabilities === 'function') {
    dispatch(MessageFactory.frameworkLoaded());

    if (unsubscribe) {
      unsubscribe();
    }

    return true;
  }
}

if (!handler()) {
  const subscribe = () => {
    if (MutationObserver) {
      const observer = new MutationObserver((mutations, observer) => handler());
      observer.observe(document, { childList: true, subtree: true });

      return () => observer.disconnect();
    }

    const eventKeys = ['DOMNodeInserted', 'DOMNodeRemoved'];

    eventKeys.forEach(k => document.addEventListener(k, handler, false));

    return () => eventKeys.forEach(k => document.removeEventListener(k, handler, false));
  }

  unsubscribe = subscribe();
}
