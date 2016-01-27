import {DomController} from './controllers/dom';
import {Angular2Adapter} from './adapters/angular2';
import Highlighter from './utils/Highlighter';

let channel = {
  sendMessage: (message) => {
    console.log('Inspected script sending: ', message);
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
    console.log('Inspected script received: ', event.data);

    console.log('event.data.message.message.actionType: ',
      event.data.message.message.actionType);

    if (event.data.message.message.actionType ===
      'START_COMPONENT_TREE_INSPECTION') {

      adapter._observer.disconnect();
      adapter.cleanup();

      // adapter.reset();
      adapter = new Angular2Adapter();
      dom = new DomController(adapter, channel);
      dom.hookIntoBackend();
      adapter.setup();
      // adapter._handleChanges([]);
    } else if (event.data.message.message.actionType === 'HIGHLIGHT_NODE') {
      let highlightStr = '[batarangle-id=\"' +
        event.data.message.message.node.id + '\"]';
      Highlighter.clear();
      Highlighter.highlight(document.querySelector(highlightStr), '');
    } else if (event.data.message.message.actionType === 'CLEAR_HIGHLIGHT') {
      Highlighter.clear();
    }

    return true;
  }
}, false);
