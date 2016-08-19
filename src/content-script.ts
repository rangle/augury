import {
  Message,
  MessageFactory,
  MessageType,
  browserDispatch,
  browserSubscribe,
  browserSubscribeDispatch,
  browserSubscribeOnce,
} from './communication';

import {
  send,
  subscribe,
} from './backend/connection';

const scriptInjection = new Set<string>();

const injectScript = (path: string) => {
  if (scriptInjection.has(path)) {
    return;
  }

  const script = document.createElement('script');
  script.src = chrome.extension.getURL(path);
  document.documentElement.appendChild(script);
  script.parentNode.removeChild(script);

  scriptInjection.add(path);
};

browserSubscribeOnce(MessageType.FrameworkLoaded,
  () => {
    injectScript('build/backend.js')
    return true;
  });

browserSubscribeDispatch(message => {
  if (message.messageType === MessageType.DispatchWrapper) {
    send(message.content)
      .then(response => {
        browserDispatch(MessageFactory.response(message, response));
      })
      .catch(error => {
        browserDispatch(MessageFactory.response(message, error));
      });
  }
});

subscribe((message: Message<any>) => browserDispatch(message));

send(MessageFactory.initialize())
  .then((response: {extensionId: string}) => {
    const script = document.createElement('script');
    script.text = `window.auguryExtensionId = "${response.extensionId}";`
    document.documentElement.appendChild(script);
    script.parentNode.removeChild(script);

    injectScript('build/ng-validate.js');
  })
  .catch(error => {
    console.error('Augury initialization has failed', error.stack);
    console.error(error);
  });