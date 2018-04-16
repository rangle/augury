import {
  Message,
  MessageFactory,
  MessageType,
  DispatchHandler,
  messageJumpContext,
  browserSubscribeDispatch,
  browserSubscribeOnce,
} from './communication';

import {
  send,
  subscribe,
} from './backend/connection';

import {loadOptions, SimpleOptions} from './options';

const scriptInjection = new Set<string>();

const inject = (fn: (element: HTMLScriptElement) => void) => {
  const script = document.createElement('script');
  fn(script);
  document.documentElement.appendChild(script);
  script.parentNode.removeChild(script);
};

const injectScript = (path: string) => {
  if (scriptInjection.has(path)) {
    return;
  }

  inject(script => {
    script.src = chrome.extension.getURL(path);
  });

  scriptInjection.add(path);
};

export const injectSettings = (options: SimpleOptions) => {
  inject(script => {
    const serialized = JSON.stringify(options);

    script.textContent = `this.treeRenderOptions = ${serialized};`;
  });
};

browserSubscribeOnce(MessageType.FrameworkLoaded,
  <DispatchHandler>(() => {
    loadOptions().then(options => {
      // We want to load the tree rendering options that the UI has saved
      // because that allows us to send the correct tree immediately upon
      // startup and send it to the message queue, allowing Augury to render
      // instantly as soon as the application is loaded. Without this bit
      // of code we would have to wait for the frontend to start and load its
      // options and then request the tree, which would add a lot of latency
      // to startup.
      injectSettings(options);

      injectScript('build/backend.js');
    });

    return true;
  }));

browserSubscribeDispatch(<DispatchHandler>((message: any) => {
  if (message.messageType === MessageType.DispatchWrapper) {
    send(message.content)
      .then(response => {
        messageJumpContext(MessageFactory.response(message, response, true));
      })
      .catch(error => {
        messageJumpContext(MessageFactory.response(message, error, false));
      });
  }
}));

subscribe((message: Message<any>) => messageJumpContext(message));

send(MessageFactory.initialize())
  .then((response: {extensionId: string}) => {
    injectScript('build/ng-validate.js');
  })
  .catch(error => {
    console.error('Augury initialization has failed', error);
  });

const propertyKey = '$$el';
const warningText = `$$el will only be set in the 'top' execution context, \
which you can select via the dropdown in the console pane \
(https://developers.google.com/web/tools/chrome-devtools/console/\
#execution-context).`;

Object.defineProperty(window, propertyKey, { value: warningText });
