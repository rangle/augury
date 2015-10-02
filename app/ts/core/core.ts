import { Observable, Subject } from 'rx';


export const componentStream = new Subject();
export const stateStream = new Subject();


function componentRef(compEl) {
  return compEl.nativeElement;
}

function componentInstance(compEl) {
  return compEl.componentInstance;
}

function componentID(compEl) {
  return componentRef(compEl).getAttribute('data-ngid').replace(/#/g, '.');
}

function componentName(compEl) {
  return componentInstance(compEl).constructor.name;
}

function componentState(compEl) {
  return Object.assign({}, componentInstance(compEl));
}

function componentProperties(compEl) {
  const BLACKLIST = [
    'class',
    'data-ngid',
  ];
  const attrArr = Array.prototype.slice.call(componentRef(compEl).attributes);

  return Object.keys(attrArr)
    .filter(attr => {
      return !BLACKLIST.includes(attr.nodeName);
    })
    .reduce((attrMap, attr) => {
      if (attr.nodeName !== undefined) {
        attrMap[attr.nodeName] = attr.nodeValue;
      }

      return attrMap;
    }, {});
}

function buildComponentEvent(compEl) {
  return {
    ref: componentRef(compEl),
    id: componentID(compEl),
    name: componentName(compEl),
    properties: componentProperties(compEl),
  }
}

function emitComponentEvent(eventType, compEl) {
  return {
    eventType,
    component: buildComponentEvent(compEl),
  };
}

function emitStateEvent(compEl) {
  return {
    componentRef: componentRef(compEl),
    prev: null,
    next: componentState(compEl),
  }
}

function getComponentChildren(compEl) {
  return compEl.componentViewChildren;
}

function traverseTree(compEl, cb) {
  cb(compEl);

  const children = getComponentChildren(compEl);

  if (!children.length) return;

  children.forEach((child) => {
    traverseTree(child, cb);
  });
}

function attachComponents(stream, treeRoot) {
  const EVENT_TYPES = {
    ADD: 'added',
    REMOVE: 'removed',
    MOVE: 'moved',
    CHANGE: 'changed',
  };

  traverseTree(treeRoot, (el) => {
    stream.onNext(emitComponentEvent(EVENT_TYPES.ADD, el));
  });
}

function attachState(stream, treeRoot) {
  traverseTree(treeRoot, (el) => {
    stream.onNext(emitStateEvent(el));
  });
}

function init() {
  const appRoot = document.querySelector('[data-ngid]');
  const debugEl = ng.probe(appRoot);

  attachComponents(componentStream, debugEl);
  attachState(stateStream, debugEl);
}
