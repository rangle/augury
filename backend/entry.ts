import {DomController} from './controllers/dom';
import {Angular2Adapter} from './adapters/angular2';
import Highlighter from './utils/highlighter';

declare var ng: { probe: Function };

const ERROR_MESSAGE = 'Please bind the default AppViewListener to'
  + 'DebugElementViewListener during the bootstrapping of your app refer:'
  + 'https://github.com/rangle/batarangle#current-limitations';

let channel = {
  sendMessage: (message) => {
    return window.postMessage(JSON.parse(JSON.stringify({
      type: 'BATARANGLE_INSPECTED_APP',
      message
    })), '*');
  }
};

// TODO: Look into starting this in one place
// i.e. in the code processing START_COMPONENT_TREE_INSPECTION action
let adapter = new Angular2Adapter();
let dom = new DomController(adapter, channel);
dom.hookIntoBackend();
  adapter.setup();


window.addEventListener('message', function(event) {
  // We only accept messages from ourselves
  if (event.source !== window) {
    return;
  }

  if (event.data.type && (event.data.type === 'BATARANGLE_CONTENT_SCRIPT')) {

    if (event.data.message.message.actionType ===
      'START_COMPONENT_TREE_INSPECTION') {

      adapter._observer.disconnect();
      adapter.cleanup();

      adapter = new Angular2Adapter();
      dom = new DomController(adapter, channel);
      dom.hookIntoBackend();
      adapter.setup();
    } else if (event.data.message.message.actionType === 'HIGHLIGHT_NODE') {
      let highlightStr = '[batarangle-id=\"' +
        event.data.message.message.node.id + '\"]';
      Highlighter.clear();
      Highlighter.highlight(document.querySelector(highlightStr),
        event.data.message.message.node.name);
    } else if (event.data.message.message.actionType === 'CLEAR_HIGHLIGHT') {
      Highlighter.clear();
    } else if (event.data.message.message.actionType === 'SELECT_NODE') {
      let highlightStr = '[batarangle-id=\"' +
        event.data.message.message.node.id + '\"]';

      (<HTMLElement>document.querySelector(highlightStr)).scrollIntoView();

      Object.defineProperty(window, '$a', {
        configurable: true,
        value: ng.probe(document.querySelector(highlightStr))
      });
    }

    return true;
  }
}, false);
