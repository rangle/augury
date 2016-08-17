import {
  MessageFactory,
  MessageType,
  dispatch,
  sendToExtension,
  subscribeOnce,
} from './channel';

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

subscribeOnce(MessageType.FrameworkLoaded,
  () => {
    injectScript('build/backend.js')
    return true;
  });

sendToExtension(MessageFactory.initialize())
  .then(response => {
    injectScript('build/ng-validate.js');
  })
  .catch(error => {
    console.error('Augury initialization has failed');
    console.error(error);
  });

chrome.runtime.onMessage.addListener(
  (message, sender, sendResponse) => {
    sendResponse(dispatch(message));
  });