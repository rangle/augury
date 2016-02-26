import {DomController} from './controllers/dom';
import {Angular2Adapter} from './adapters/angular2';
import Highlighter from './utils/highlighter';
import ParseData from '../frontend/utils/parse-data';

declare var ng: { probe: Function };

let channel = {
  sendMessage: (message) => {
    return window.postMessage(JSON.parse(JSON.stringify({
      type: 'BATARANGLE_INSPECTED_APP',
      message
    })), '*');
  }
};

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
      const highlightStr = '[batarangle-id=\"' +
        event.data.message.message.node.id + '\"]';
      Highlighter.clear();
      Highlighter.highlight(document.querySelector(highlightStr),
        event.data.message.message.node.name);
    } else if (event.data.message.message.actionType === 'CLEAR_HIGHLIGHT') {
      Highlighter.clear();
    } else if (event.data.message.message.actionType === 'SELECT_NODE') {
      const highlightStr = '[batarangle-id=\"' +
        event.data.message.message.node.id + '\"]';

      (<HTMLElement>document.querySelector(highlightStr)).scrollIntoView();

      Object.defineProperty(window, '$a', {
        configurable: true,
        value: ng.probe(document.querySelector(highlightStr))
      });
    } else if (event.data.message.message.actionType === 'UPDATE_PROPERTY') {
      const highlightStr = '[batarangle-id=\"' +
        event.data.message.message.property.id + '\"]';

      const dE = ng.probe(document.querySelector(highlightStr));
      if (dE.componentInstance[event.data.message.message.property.key]
          !== undefined) {

        const type: string = event.data.message.message.property.type;
        let newValue: any;

        if (type === 'number') {
          newValue =
            ParseData.parseNumber(event.data.message.message.property.value);
        } else if (type === 'boolean') {
          newValue =
            ParseData.parseBoolean(event.data.message.message.property.value);
        } else {
          newValue = event.data.message.message.property.value;
        }

        dE.componentInstance[event.data.message.message.property.key] =
          newValue;
        dE.injector._depProvider.componentView.changeDetector.detectChanges();
      }
    }

    return true;
  }
}, false);
