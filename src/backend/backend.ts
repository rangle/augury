import Highlighter from './utils/highlighter';
import ParseData from '../frontend/utils/parse-data';

declare var ng: { probe: Function, coreTokens: any };

let channel = {
  sendMessage: (message) => {
    return window.postMessage(JSON.parse(JSON.stringify({
      type: 'BATARANGLE_INSPECTED_APP',
      message
    })), '*');
  }
};

let adapter, dom;

/*
 * We only hook batarangle to the DOM if "ng" is a variable
 * on the window. This signifies that the app is likely to be Angular 2
 */
if (window.hasOwnProperty('ng')) {
  const {Angular2Adapter} = require('./adapters/angular2');
  const {DomController} = require('./controllers/dom');

  adapter = new Angular2Adapter();
  dom = new DomController(adapter, channel);

  dom.hookIntoBackend();
  adapter.setup();
}

window.addEventListener('message', function(event) {
  // We only accept messages from ourselves
  if (event.source !== window) {
    return;
  }

  if (event.data.type && (event.data.type === 'BATARANGLE_CONTENT_SCRIPT')) {

    if (event.data.message.message.actionType ===
      'START_COMPONENT_TREE_INSPECTION') {
      adapter.renderTree();
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

      const highlightStr = '[batarangle-id=\"' +
        event.data.message.message.property.id + '\"]';
      const dE = ng.probe(document.querySelector(highlightStr));
      const propertyTree: Array<string> =
        event.data.message.message.property.propertyTree.split(',');
      let property = propertyTree.pop();

      // replace with existing property as we normalized data initally
      if (dE.componentInstance.constructor.name === 'NgStyle') {
        propertyTree[0] = '_rawStyle';
      } else if (dE.componentInstance.constructor.name === 'NgSwitch') {
        property = '_' + property;
      } else if (dE.componentInstance.constructor.name === 'NgClass') {
        propertyTree[0] = '_' + propertyTree[0];
      }

      const value = propertyTree.reduce((previousValue, currentValue) =>
        previousValue[currentValue], dE.componentInstance);

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
    }

    return true;
  }
}, false);
