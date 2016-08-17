import {DomController} from './controllers/dom';
import {Angular2Adapter} from './adapters/angular2';
import {deserialize, serialize} from '../utils/serialize';
import Highlighter from './utils/highlighter';
import ParseData from '../frontend/utils/parse-data';

declare var ng: { probe: Function, coreTokens: any };

let channel = {
  sendMessage: (message) => {
    const m = {
      type: 'AUGURY_INSPECTED_APP',
      message: message,
      serialized: false
    };

    // If we can get away with sending the raw object, then do so, but if we
    // get a DataCloneError exception then we must resort to an expensive
    // serialization operation.
    const send = () => window.postMessage(m, '*');

    try {
      return send();
    }
    catch (e) { // DataCloneError
      m.message = serialize(m.message);
      m.serialized = true;

      return send();
    }
  }
};

let adapter = new Angular2Adapter();
let dom = new DomController(adapter, channel);
dom.hookIntoBackend();
adapter.setup();

function getFunctionName(value: string) {
  let name = value.toString();
  name = name.substr('function '.length);
  name = name.substr(0, name.indexOf('('));
  return name;
}

window.addEventListener('message', function(event) {
  // We only accept messages from ourselves
  if (event.source !== window) {
    return;
  }

  if (event.data.type && (event.data.type === 'AUGURY_CONTENT_SCRIPT')) {
    if (event.data.message.serialized) {
      event.data.message.message = deserialize(event.data.message.message);
      event.data.message.serialized = false;
    }

    if (event.data.message.message.actionType ===
      'START_COMPONENT_TREE_INSPECTION') {
      adapter.renderTree();
    } else if (event.data.message.message.actionType === 'HIGHLIGHT_NODE') {
      const highlightStr = '[augury-id=\"' +
        event.data.message.message.node.id + '\"]';
      Highlighter.clear();
      Highlighter.highlight(document.querySelector(highlightStr),
        event.data.message.message.node.name);
    } else if (event.data.message.message.actionType === 'CLEAR_HIGHLIGHT') {
      Highlighter.clear();
    } else if (event.data.message.message.actionType === 'SELECT_NODE') {
      const highlightStr = '[augury-id=\"' +
        event.data.message.message.node.id + '\"]';

      const element: HTMLElement =
        <HTMLElement>document.querySelector(highlightStr);
      if (element) {
        element.scrollIntoView();

        Object.defineProperty(window, '$a', {
          configurable: true,
          value: ng.probe(document.querySelector(highlightStr))
        });
      }

    } else if (event.data.message.message.actionType === 'UPDATE_PROPERTY') {

      const highlightStr = '[augury-id=\"' +
        event.data.message.message.property.id + '\"]';
      const dE = ng.probe(document.querySelector(highlightStr));

      const path: Array<string> = event.data.message.message.property.path;
      let property = path.pop();

      // replace with existing property as we normalized data initally
      if (!dE.componentInstance &&
        getFunctionName(dE.providerTokens[0]) === 'NgStyle') {
        path[0] = '_rawStyle';
      } else if (!dE.componentInstance &&
        getFunctionName(dE.providerTokens[0]) === 'NgSwitch') {
        property = '_' + property;
      } else if (!dE.componentInstance &&
        getFunctionName(dE.providerTokens[0]) === 'NgClass') {
        path[0] = '_' + path[0];
      }

      let instance = dE.componentInstance;
      if (!instance) {
        instance = dE.injector.get(dE.providerTokens[0]);
      }

      const value = path.reduce((previousValue, currentValue) =>
        previousValue[currentValue], instance);

      if (value !== undefined) {
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

        value[property] = newValue;

        const appRef = dE.inject(ng.coreTokens.ApplicationRef);
        appRef.tick();
        adapter.renderTree();
      }
    } else if (event.data.message.message.actionType === 'RENDER_ROUTER_TREE') {
      adapter.showAppRoutes();
    } else if (event.data.message.message.actionType === 'FIRE_EVENT') {
      const highlightStr = '[augury-id=\"' +
        event.data.message.message.data.id + '\"]';
      const dE = ng.probe(document.querySelector(highlightStr));
      dE.componentInstance[event.data.message.message.data.output]
        .emit(event.data.message.message.data.data);

      setTimeout(() => {
        const appRef = dE.inject(ng.coreTokens.ApplicationRef);
        appRef.tick();
        adapter.renderTree();
      });
    }

    return true;
  }
}, false);
